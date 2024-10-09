import numpy as np
from scipy.spatial import KDTree
from pythonosc import udp_client
from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import BlockingOSCUDPServer
import time
import threading

class LatentSpace():
    def __init__(self, dataset, clientPd, clientJS, dimensionality=3, k=150):
        self.dimensionality = dimensionality
        self.clientPd = clientPd
        self.clientJS = clientJS
        self.latent = np.squeeze(dataset['reduced_latent_matrix'][:, :self.dimensionality])
        self.parameter = np.squeeze(dataset['parameter_matrix'])
        self.kd_tree = KDTree(self.latent)
        self.current_index = None
        self.current_latent_coordinate = None
        self.current_parameters = None
        self.neighbors = k
        self.current_path = None
        self.path_cache = {}
        self.is_playing_crossfade = False
        self.is_playing_meander = False

    def play_benjo(self):
        self.clientPd.send_message("/stop", 1)
        params_message = '-'.join([str(int(param)) for param in self.current_parameters])
        self.clientPd.send_message("/params", params_message)

    def stop_benjo(self):
        self.clientPd.send_message("/stop", 0)

    def get_current_index(self):
        return self.current_index
    
    def set_current_point(self, index):
        self.current_index = index
        self.current_latent_coordinate = self.latent[self.current_index, :]
        self.current_parameters = self.parameter[self.current_index, :]
        self.play_benjo()

    def get_point_info(self, index):
        return self.latent[index, :], self.parameter[index, :]
    
    def get_index_given_latent(self, latent):
        distance, index = self.kd_tree.query(latent, k=1)
        return index

    def pre_uniformize(self):
        x_ind_sorted = np.argsort(self.latent[:, 0])
        y_ind_sorted = np.argsort(self.latent[:, 1])

        n = len(self.latent)

        new_x = np.zeros((n))
        new_x[x_ind_sorted] = np.arange(n)
        new_y = np.zeros((n))
        new_y[y_ind_sorted] = np.arange(n)

        if self.dimensionality == 3:
            z_ind_sorted = np.argsort(self.latent[:, 2])
            new_z = np.zeros((n))
            new_z[z_ind_sorted] = np.arange(n)
            return np.column_stack((new_x, new_y, new_z)) / n

        new_points = np.column_stack((new_x, new_y)) / n
        return new_points
    
    def find_next_point(self, a, b, path):
        """
        Finds a point adjacent to a that is in the direction of b, with the least distance in parameter space

        Args:
            a - index of the current point
            b - index of the point to move towards
        """
        a_latent, a_param = self.get_point_info(a)
        b_latent, b_param = self.get_point_info(b)
        param_distance_0 = np.linalg.norm(a_param - b_param)
        latent_distance_0 = np.linalg.norm(a_latent - b_latent)

        k = self.neighbors
        distances, indices = self.kd_tree.query(a_latent, k=k)
        indices = np.squeeze(indices)
    
        param_space_distances = np.zeros((k))
        latent_space_distances = np.zeros((k))
        cost_values = np.zeros((k))
        constant = 0.0

        for i in range(k):
            index = indices[i]
            if index == b:
                return b
            if index in path:
                param_space_distances[i] = np.nan
                latent_space_distances[i] = np.nan
            else:
                k_latent, k_param = self.get_point_info(indices[i])
                param_distance_to_a = np.linalg.norm(k_param - a_param)
                latent_distance_to_b = np.linalg.norm(b_latent - k_latent)
                if latent_distance_to_b > latent_distance_0:
                    latent_distance_to_b = np.nan
                param_space_distances[i] = param_distance_to_a
                latent_space_distances[i] = latent_distance_to_b
            cost_values[i] = param_space_distances[i] + latent_space_distances[i]
        argmin = np.nanargmin(cost_values)
        # if np.any(np.isnan(cost_values)): print(cost_values)
        index_of_best = indices[argmin]
        
        if index_of_best == a:
            raise Exception
        
        return index_of_best

    def calculate_meander(self, idx1, idx2):
        reached_goal = False
        path = np.array([idx1])
        steps = 0
        while not reached_goal:
            steps += 1
            if steps > 1000:
                return path
            new_point = self.find_next_point(idx1, idx2, path)
            path = np.append(path, new_point)
            idx1 = new_point
            if new_point == idx2:
                reached_goal == True
                break
        return path

    def get_meander(self, x1, y1, z1, x2, y2, z2):
        idx1 = self.get_index_given_latent([x1, y1, z1])
        idx2 = self.get_index_given_latent([x2, y2, z2])
        key = str(idx1) + "-" + str(idx2)
        if key in self.path_cache:
            return self.path_cache[key]
        else:
            path_of_indices = self.calculate_meander(idx1, idx2)
            self.path_cache[key] = path_of_indices
            return path_of_indices
        
    def play_box_handler(self, address: str, *args):
        print(f'received msg: {address}, playing box coords {args[0]:.3f}, {args[1]:.3f} and {args[2]:.3f} ')
        x, y, z= args[0], args[1], args[2]
        index = self.get_index_given_latent([x, y, z])
        self.set_current_point(index=index)
        self.is_playing_crossfade = False
        self.is_playing_meander = False

    def play_meander_handler(self, address: str, *args):
        print(f'received msg: {address}, playing meander coords {args[0]:.3f}, {args[1]:.3f}, {args[2]:.3f} --> {args[3]:.3f}, {args[3]:.3f}, {args[5]:.3f} in {args[6]:.2f} s')
        x1, y1, z1, x2, y2, z2, t = args[0], args[1], args[2], args[3], args[4], args[5], int(args[4])
        path_of_indices = self.get_meander(x1, y1, z1, x2, y2, z2)
        length = path_of_indices.shape[0]
        time_per_point = t / length

        # Set a flag to indicate that the function is running
        self.is_playing_meander = True
        self.is_playing_crossfade = False
        # Create a new thread to play the meander in the background
        thread = threading.Thread(target=self._play_meander_in_background, args=(length, path_of_indices, time_per_point))
        thread.start()

    def _play_meander_in_background(self, length, path_of_indices, time_per_point):
        self.clientPd.send_message("/stop", 1)
        for i in range(length):
            if not self.is_playing_meander:
                return
            self.set_current_point(path_of_indices[i])
            # params = cloud.parameter[path_of_indices[i], :]
            # params_message = '-'.join([str(int(param)) for param in params])
            # clientPd.send_message("/params", params_message)
            time.sleep(time_per_point)

    def play_crossfade_handler(self, address: str, *args):
        print(f'received msg: {address}, playing crossfade coords {args[0]:.3f}, {args[1]:.3f} {args[2]:.3f} --> {args[3]:.3f}, {args[4]:.3f}, {args[5]:.3f} in {args[5]:.2f} s')
        x1, y1, x2, y2, t = args[0], args[1], args[2], args[3], int(args[4])
        idx1 = self.get_index_given_latent([x1, y1])
        idx2 = self.get_index_given_latent([x2, y2])
        _, params1 = self.get_point_info(index=idx1)
        _, params2 = self.get_point_info(index=idx2)
        time_per_point = 0.1
        steps = 10 * t

        # Set a flag to indicate that the function is running
        self.is_playing_crossfade = True
        self.is_playing_meander = False
        # Create a new thread to play the crossfade in the background
        thread = threading.Thread(target=self._play_crossfade_in_background, args=(params1, params2, steps, time_per_point))
        thread.start()

    def _play_crossfade_in_background(self, params1, params2, steps, time_per_point):
        for i in range(steps):
            if not self.is_playing_crossfade:
                return
            b = i / steps
            a = 1 - b
            params = params1 * a + params2 * b
            params_message = '-'.join([str(int(param)) for param in params])
            clientPd.send_message("/params", params_message)
            time.sleep(time_per_point)

    def drawMeander_handler(self, address: str, *args):
        print(f'received msg: {address}, sending draw meander coords {args[0]:.3f}, {args[1]:.3f} --> {args[2]:.3f}, {args[3]:.3f}')
        x1, y1, z1, x2, y2, z2 = args[0], args[1], args[2], args[3], args[4], args[5]
        path_of_indices = self.get_meander(x1, y1, z1, x2, y2, z2)
        path_of_latents = self.latent[path_of_indices, :]

        #-------------------------NOTA BENE:-------------------------------
        # changed the lines below, this sends the index of each point in the path like:
        # path_message = "idx0-idx1-idx2..."
        # uses up less network but you need to get the coordinates in JS given the indices
        path_message = '-'.join([str(int(index)) for index in path_of_indices])

        # this could also work but takes up more network where we send each point's 
        # xyz-coordinates like "x0-y0-z0-x1-y1-z1-x2-y2-z2..." etc
        # path_message = ""
        # for point_coords in path_of_latents:
            # path_message += '-'.join([str(int(coord)) for coord in point_coords])

        # the code below is the old one
        # path_of_latents = self.parameter[path_of_indices, :]
        # path_of_indices_message = '-'.join([str(int(param)) for param in path_of_indices])

        self.clientJS.send_message("/meanderPath", path_message)

    def stop_handler(self, address: str):
        print(f'received msg: {address}')
        self.stop_benjo()
        self.is_playing_crossfade = False
        self.is_playing_meander = False


def default_handler(message):
    print(f"Unrecognised message: {message}")


if __name__ == "__main__":
    # ENTER HERE THE DIRECTORY OF THE NPZ DATASET
    data_dir = "./latent_param_dataset_16.npz"
    dataset = np.load(data_dir)
    dimensionality = 3

    ip = "127.0.0.1"  # localhost
    send_port_pd = 8000  # must match the port declared in Pure data
    send_port_js = 8001 # must match the listen port in JS
    listen_port = 6666 # must match the send post in JS
    clientPd = udp_client.SimpleUDPClient(ip, send_port_pd)  # sender to Pd
    clientJS = udp_client.SimpleUDPClient(ip, send_port_js)  # sender to JS
    dispatcher = Dispatcher()
    server = BlockingOSCUDPServer((ip, listen_port), dispatcher)  # listener

    cloud = LatentSpace(dataset=dataset, clientPd=clientPd, clientJS=clientJS,
                         dimensionality=dimensionality)


    # dispatcher.map("/print", print_handler)
    dispatcher.map("/play/box", handler=cloud.play_box_handler)
    dispatcher.map("/play/meander", handler=cloud.play_meander_handler)
    dispatcher.map("/play/crossfade", handler=cloud.play_crossfade_handler)
    dispatcher.map("/draw/meander", handler=cloud.drawMeander_handler)
    dispatcher.map("/stop", handler=cloud.stop_handler)
    dispatcher.set_default_handler(default_handler)
    print("Set up complete! Start playing the benjolin!")
    server.serve_forever()  # Blocks forever
