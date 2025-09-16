import { datasetJS } from "datasetJS";
import { KDTree } from 'kdtree'; // Uncomment if using module imports
// var createKDTree = require("static-kdtree")
// import { Benjolin } from 'benjolin';


class LatentSpace {
    /**
     * Initializes the LatentSpace with dataset and configuration.
     * @param {Object} dataset - An object containing 'reduced_latent_matrix' and 'parameter_matrix'.
     * Each matrix is an array of arrays.
     * @param {number} dimensionality - The dimensionality of the latent space (e.g., 3).
     * @param {number} k - The number of neighbors to consider for pathfinding.
     */
    constructor(dataset, dimensionality = 3, k = 150) {
        this.dimensionality = dimensionality;
        this.neighbors = k;
        this.path_cache = {}; // Cache for meander paths
        this.dataset = dataset;
        this.lookUp = {}; // For quick index lookup
    }

    transformData() {
        const points = [];
        for (let i = 0; i < this.dataset.x.length; i++) {
            points.push([this.dataset.x[i], this.dataset.y[i], this.dataset.z[i]]);
            this.lookUp[`${this.dataset.x[i]}-${this.dataset.y[i]}-${this.dataset.z[i]}`] = i;
        }
        return points;
    }

    getCoordinate(index) {
        let coords = [this.dataset.x[index], this.dataset.y[index], this.dataset.z[index]];
        return coords;
    }

    getParameters(index) {
        return [
            this.dataset.p1[index],
            this.dataset.p2[index],
            this.dataset.p3[index],
            this.dataset.p4[index],
            this.dataset.p5[index],
            this.dataset.p6[index],
            this.dataset.p7[index],
            this.dataset.p8[index]
        ];
    }

    calculateDistance(indexA, indexB) {
        let a = this.getCoordinate(indexA);
        let b = this.getCoordinate(indexB);
        let sum = 0;
        for (let i = 0; i < this.dimensionality; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    calculateParameterDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    makeKDTree() {
        let generator = KDTree();
        const data = this.transformData();
        this.tree = generator(data);
    }

    /**
     * Retrieves the latent coordinate and parameters for a given index.
     * @param {number} index - The index of the point.
     * @returns {Object} An object containing 'latent' (array) and 'parameters' (array).
     */
    getPointInfo(index) {
        if (index < 0 || index >= this.dataset.x.length) {
            console.error(`Index out of bounds: ${index}`);
            return { latent: null, parameters: null };
        }
        return {
            latent: this.getCoordinate(index),
            parameters: this.getParameters(index)
        };
    }

    /**
     * Finds the index of the point closest to a given latent coordinate.
     * @param {number[]} latentCoordinate - The latent coordinate to query.
     * @returns {number} The index of the closest point.
     */
    getIndexGivenLatent(latentCoordinate) {
        // using lookUp for exact match
        let key = `${latentCoordinate[0]}-${latentCoordinate[1]}-${latentCoordinate[2]}`;
        if (this.lookUp.hasOwnProperty(key)) {
            return this.lookUp[key];
        }
        return -1; // Return -1 if no point is found
    }

    getParamsGivenLatent(latentCoordinate) {
        let index = this.getIndexGivenLatent(latentCoordinate);
        let params = this.getParameters(index);
        return params;
    }


    /**
     * Finds a point adjacent to 'a' that is in the direction of 'b',
     * with the least "cost" considering both parameter and latent space distances.
     * This is a greedy approach for pathfinding.
     * @param {number} a - Index of the current point.
     * @param {number} b - Index of the target point.
     * @param {Set<number>} path - A set of indices already in the current path to avoid cycles.
     * @returns {number} The index of the next best point in the path.
     * @throws {Error} If no suitable next point can be found (e.g., stuck).
     */
    findNextPoint(a, b, path) {
        const { latent: a_latent, parameters: a_param } = this.getPointInfo(a);
        const { latent: b_latent, parameters: b_param } = this.getPointInfo(b);

        if (!a_latent || !b_latent) {
            throw new Error("Invalid point indices for pathfinding.");
        }

        const latent_distance_0 = this.calculateDistance(a_latent, b_latent);

        const nearestNeighbors = this.tree.find(a_latent, this.neighbors);

        let bestIndex = -1;
        let minCost = Infinity;

        for (let i = 1; i < this.neighbors; i++) {
            // Find the original index of the neighbor point
            let coordinate = nearestNeighbors[i].location;
            let neighborIndex = this.getIndexGivenLatent(coordinate);

            if (neighborIndex === -1) {
                console.log("Couldn't find index of point");
                continue; // Should not happen
            }

            if (neighborIndex === b) {
                console.log("Reached target point");
                return b; // Reached the target point
            }
            if (a === neighborIndex) {
                // console.log("Tree messed up and returned original point.")
                continue;
            }
            if (path.has(neighborIndex)) {
                // console.log("Skip points already in path");
                continue; // Skip points already in the path
            }

            const { parameters: k_param } = this.getPointInfo(neighborIndex);
            if (!k_param) continue;

            let param_distance_to_a = this.calculateParameterDistance(k_param, a_param);
            let latent_distance_to_b = this.calculateDistance(b, neighborIndex);

            if (latent_distance_to_b > latent_distance_0) {
                // console.log("This point would be moving away from b.");
                latent_distance_to_b = Infinity; // Penalize moving away in latent space
            }

            // The cost function combines parameter space distance and latent space distance
            const cost = param_distance_to_a * (1 / 400) + latent_distance_to_b;
            // const cost = latent_distance_to_b;
            // const cost = param_distance_to_a;

            if (cost < minCost) {
                minCost = cost;
                bestIndex = neighborIndex;
            }
        }

        if (bestIndex === -1 || bestIndex === a) {
            // This indicates a problem: either no valid next point found, or stuck at 'a'
            throw new Error("Could not find a suitable next point for pathfinding.");
        }
        return bestIndex;
    }

    /**
     * Calculates a meander path (sequence of indices) between two points.
     * This uses a greedy algorithm to find a path that balances
     * movement in latent space towards the target and minimizing parameter changes.
     * @param {number} idx1 - Starting point index.
     * @param {number} idx2 - Ending point index.
     * @returns {number[]} An array of indices representing the path.
     */
    calculateMeander(idx1, idx2) {
        const path = [idx1];
        const pathSet = new Set([idx1]); // Use a Set for efficient `in` checks
        let currentIdx = idx1;
        let steps = 0;
        const maxSteps = 1000; // Prevent infinite loops
        console.log("Beginning path finding.")

        while (currentIdx !== idx2 && steps < maxSteps) {
            steps++;
            console.log("Currently finding step: ", steps);
            try {
                const newPoint = this.findNextPoint(currentIdx, idx2, pathSet);
                path.push(newPoint);
                pathSet.add(newPoint);
                currentIdx = newPoint;
            } catch (error) {
                console.warn(`Pathfinding stopped prematurely: ${error.message}`);
                break; // Break if no suitable next point is found
            }
        }
        return path;
    }

    /**
     * Retrieves a meander path between two latent coordinates.
     * Uses a cache to avoid recomputing paths.
     * @param {number[]} latentCoord1 - Starting latent coordinate [x1, y1, z1].
     * @param {number[]} latentCoord2 - Ending latent coordinate [x2, y2, z2].
     * @returns {number[]} An array of indices representing the path.
     */
    getMeander(latentCoord1, latentCoord2) {
        const idx1 = this.getIndexGivenLatent(latentCoord1);
        const idx2 = this.getIndexGivenLatent(latentCoord2);

        if (idx1 === -1 || idx2 === -1) {
            console.error("Could not find indices for given latent coordinates.");
            return [];
        }

        const key = `${idx1}-${idx2}`;
        if (this.path_cache[key]) {
            return this.path_cache[key];
        } else {
            const pathOfIndices = this.calculateMeander(idx1, idx2);
            this.path_cache[key] = pathOfIndices;
            return pathOfIndices;
        }
    }

    /**
     * Retrieves the latent coordinates for a given path of indices.
     * @param {number[]} pathOfIndices - An array of indices.
     * @returns {number[][]} An array of latent coordinates, where each coordinate is an array [x, y, z].
     */
    getLatentCoordinatesForPath(pathOfIndices) {
        return pathOfIndices.map(index => this.getCoordinate(index));
    }

    /**
     * Retrieves the parameter values for a given path of indices.
     * @param {number[]} pathOfIndices - An array of indices.
     * @returns {number[][]} An array of parameter arrays.
     */
    getParametersForPath(pathOfIndices) {
        return pathOfIndices.map(index => this.getParameters(index));
    }
    /**
     * Calculates a crossfade (linear interpolation) of parameters between two points.
     * @param {number[]} latentCoord1 - Starting latent coordinate [x1, y1, z1].
     * @param {number[]} latentCoord2 - Ending latent coordinate [x2, y2, z2].
     * @param {number} steps - The number of interpolation steps.
     * @returns {number[][]} An array of interpolated parameter arrays.
     */
    calculateCrossfade(latentCoord1, latentCoord2, steps) {
        const idx1 = this.getIndexGivenLatent(latentCoord1);
        const idx2 = this.getIndexGivenLatent(latentCoord2);

        if (idx1 === -1 || idx2 === -1) {
            console.error("Could not find indices for given latent coordinates for crossfade.");
            return [];
        }

        const params1 = this.getParameters(idx1);
        const params2 = this.getParameters(idx2);

        if (!params1 || !params2) {
            console.error("Could not retrieve parameters for crossfade.");
            return [];
        }

        const interpolatedParams = [];
        for (let i = 0; i <= steps; i++) {
            const b = i / steps; // Interpolation factor from 0 to 1
            const a = 1 - b;     // Complementary factor

            const currentParams = params1.map((param, j) => {
                // Linear interpolation: param1 * (1-b) + param2 * b
                return param * a + params2[j] * b;
            });
            interpolatedParams.push(currentParams);
        }
        return interpolatedParams;
    }
}


// const dataset = {x, y, z, p1, p2, p3, p4, p5, p6, p7, p8};

const latentSpace = new LatentSpace(datasetJS, 3, 150);

latentSpace.makeKDTree();

console.log(latentSpace.tree);

// port.open();


var sendBox = function (send_x, send_y, send_z){
    let point = [send_x, send_y, send_z];
    let params = latentSpace.getParamsGivenLatent(point);
    return params;
}

var sendMeander = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z, meander_time){
    let point1 = [send_start_x, send_start_y, send_start_z];
    let point2 = [send_end_x, send_end_y, send_end_z];
    let pathIndices = latentSpace.getMeander(point1, point2);
    let pathParams = latentSpace.getParametersForPath(pathIndices);
    return pathParams;
}

var sendDrawMeander = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z){
    let point1 = [send_start_x, send_start_y, send_start_z];
    let point2 = [send_end_x, send_end_y, send_end_z];
    let pathIndices = latentSpace.getMeander(point1, point2);
    console.log(pathIndices);
    let pathCoords = latentSpace.getLatentCoordinatesForPath(pathIndices);
    console.log(pathCoords);
    return pathCoords;
}

var sendCrossfade = function (send_start_x, send_start_y, send_start_z, send_end_x, send_end_y, send_end_z, meander_time){
    let point1 = [send_start_x, send_start_y, send_start_z];
    let point2 = [send_end_x, send_end_y, send_end_z];
    let pathParams = latentSpace.calculateCrossfade(point1, point2, 100);
    return pathParams;
}

var sendStop = function (){
    console.log("sending stop command NB: deprecated.");
}

var sendStartrecording = function (){
    console.log("Sending startrecording command. Doesn't work yet.");
}

var sendStoprecording = function (){
    console.log("Sending stoprecording command. Doesn't work yet.");
}


export { LatentSpace, sendBox, sendMeander, sendDrawMeander, sendCrossfade, sendStop, sendStartrecording, sendStoprecording };