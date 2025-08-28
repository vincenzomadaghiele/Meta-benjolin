import numpy as np
import json
import os

def convert_npz_to_json(npz_file_path, json_file_path):
    """
    Converts a .npz file containing 'reduced_latent_matrix' and 'parameter_matrix'
    into a JSON file.

    Args:
        npz_file_path (str): The path to the input .npz file.
        json_file_path (str): The path where the output JSON file will be saved.
    """
    try:
        # Load the .npz file
        with np.load(npz_file_path) as data:
            reduced_latent_matrix = data['reduced_latent_matrix']
            parameter_matrix = data['parameter_matrix']

        # Convert NumPy arrays to Python lists
        # .tolist() is crucial for converting NumPy arrays into native Python lists,
        # which are directly compatible with JSON serialization.
        reduced_latent_list = reduced_latent_matrix.tolist()
        parameter_list = parameter_matrix.tolist()

        # Create a Python dictionary to hold your data
        # This dictionary structure will become your JSON object.
        js_data = {
            'reduced_latent_matrix': reduced_latent_list,
            'parameter_matrix': parameter_list
        }

        # Serialize the dictionary to a JSON string and save it to a .json file
        # The 'indent=4' argument makes the JSON output human-readable with indentation.
        json_output = json.dumps(js_data, indent=4)

        with open(json_file_path, 'w') as f:
            f.write(json_output)

        print(f"Successfully converted '{npz_file_path}' to '{json_file_path}'.")
        print("A snippet of the generated JSON:")
        print(json_output[:500]) # Print first 500 characters to show structure

    except FileNotFoundError:
        print(f"Error: The file '{npz_file_path}' was not found.")
    except KeyError as e:
        print(f"Error: Missing expected key in .npz file: {e}. Ensure 'reduced_latent_matrix' and 'parameter_matrix' are present.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# --- How to use the script ---
if __name__ == "__main__":
    # Replace 'latent_param_dataset_16.npz' with the actual path to your .npz file
    input_npz_file = 'latent_param_dataset_16.npz'
    output_json_file = 'latent_space_data.json'

    # For demonstration, you might need to create a dummy .npz if you don't have one:
    # dummy_reduced_latent_matrix = np.random.rand(10, 3)
    # dummy_parameter_matrix = np.random.rand(10, 8)
    # np.savez(input_npz_file,
    #          reduced_latent_matrix=dummy_reduced_latent_matrix,
    #          parameter_matrix=dummy_parameter_matrix)
    # print(f"Created a dummy file: {input_npz_file}")

    convert_npz_to_json(input_npz_file, output_json_file)
    print("theoretically done")
    # Optional: Clean up dummy file after conversion if it was created
    # if os.path.exists(input_npz_file) and input_npz_file == 'latent_param_dataset_16.npz':
    #     os.remove(input_npz_file)
    #     print(f"Removed dummy file: {input_npz_file}")