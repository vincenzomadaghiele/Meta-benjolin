
import { createKDTree } from 'static-kdtree'; // Uncomment if using module imports
// var createKDTree = require("static-kdtree")


export class LatentSpace {
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
    }

    getCoordinate(index) {
        if (index < 0 || index >= this.dataset.reduced_latent_matrix.length) {
            console.error(`Index out of bounds: ${index}`);
            return null;
        }
        return [this.dataset.x[index], this.dataset.y[index], this.dataset.z[index]];
    }

    getParameters(index) {
        if (index < 0 || index >= this.dataset.parameter_matrix.length) {
            console.error(`Index out of bounds: ${index}`);
            return null;
        }
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
        let a = getCoordinate(indexA);
        let b = getCoordinate(indexB);
        let sum = 0;
        for (let i = 0; i < this.dimensionality; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    makeKDTree() {
        this.kdt = createKDTree([this.dataset.x, this.dataset.y, this.dataset.z]);
        console.log("KD-Tree created. Dimensionality and length:");
        console.log(this.kdt.dimension, this.kdt.length);
    }

    /**
     * Retrieves the latent coordinate and parameters for a given index.
     * @param {number} index - The index of the point.
     * @returns {Object} An object containing 'latent' (array) and 'parameters' (array).
     */
    getPointInfo(index) {
        if (index < 0 || index >= this.latent.length) {
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
        // This might be extremely slow, unfortunately the kd-tree does not return indices
        // So we perform a linear search here instead
        for (let i = 0; i < this.latent.length; i++) {
            if (this.latent[i].every((val, j) => val === latentCoordinate[j])) {
                return i;
            }
        }
        return -1; // Return -1 if no point is found
    }

    /**
     * Calculates the Euclidean distance between two points.
     * @param {number[]} p1 - First point.
     * @param {number[]} p2 - Second point.
     * @returns {number} The Euclidean distance.
     */
    _calculateEuclideanDistance(p1, p2) {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
            sum += (p1[i] - p2[i]) ** 2;
        }
        return Math.sqrt(sum);
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

        const latent_distance_0 = this._calculateEuclideanDistance(a_latent, b_latent);

        // Query k nearest neighbors from point 'a'
        // The KD-tree returns an array of [{point: ..., distance: ...}]
        const nearestNeighbors = this.kd_tree.nearest(a_latent, this.neighbors);

        let bestIndex = -1;
        let minCost = Infinity;

        for (const [neighborPoint, distanceToA] of nearestNeighbors) {
            // Find the original index of the neighbor point
            let neighborIndex = -1;
            for (let i = 0; i < this.latent.length; i++) {
                if (this.latent[i].every((val, j) => val === neighborPoint[j])) {
                    neighborIndex = i;
                    break;
                }
            }

            if (neighborIndex === -1) continue; // Should not happen

            if (neighborIndex === b) {
                return b; // Reached the target point
            }
            if (path.has(neighborIndex)) {
                continue; // Skip points already in the path
            }

            const { parameters: k_param } = this.getPointInfo(neighborIndex);
            if (!k_param) continue;

            const param_distance_to_a = this._calculateEuclideanDistance(k_param, a_param);
            let latent_distance_to_b = this._calculateEuclideanDistance(b_latent, neighborPoint);

            // If the neighbor is further from 'b' than 'a' is from 'b',
            // it's generally not a good step towards 'b' in latent space.
            // This heuristic helps guide the path.
            if (latent_distance_to_b > latent_distance_0) {
                latent_distance_to_b = Infinity; // Penalize moving away in latent space
            }

            // The cost function combines parameter space distance and latent space distance
            const cost = param_distance_to_a + latent_distance_to_b;

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

        while (currentIdx !== idx2 && steps < maxSteps) {
            steps++;
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
        return pathOfIndices.map(index => this.latent[index]);
    }

    /**
     * Retrieves the parameter values for a given path of indices.
     * @param {number[]} pathOfIndices - An array of indices.
     * @returns {number[][]} An array of parameter arrays.
     */
    getParametersForPath(pathOfIndices) {
        return pathOfIndices.map(index => this.parameter[index]);
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

        const { parameters: params1 } = this.getPointInfo(idx1);
        const { parameters: params2 } = this.getPointInfo(idx2);

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
