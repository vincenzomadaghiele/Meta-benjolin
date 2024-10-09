

const kdTree = require("kd-tree-javascript")

const fs = require('fs');
const csv = require('csv-parser');

const latent_coordinates = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    latent_coordinates.push(row);
  })

var distance = function(a, b) {
  return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
}

var distanceParam = function(a, b) {
  return Math.pow(a.p1 - b.p1, 2) +  Math.pow(a.p2 - b.p2, 2) + Math.pow(a.p3 - b.p3, 2) +
        Math.pow(a.p4 - b.p4, 2) +  Math.pow(a.p5 - b.p5, 2) + Math.pow(a.p6 - b.p6, 2) +
        Math.pow(a.p7 - b.p7, 2) +  Math.pow(a.p8 - b.p8, 2);
}

function findIndexOfMinValue(array) {
  if (array.length === 0) {
    return -1; // Handle empty array
  }

  let minIndex = 0;
  let minValue = array[0];

  for (let i = 1; i < array.length; i++) {
    if (array[i] < minValue) {
      minIndex = i;
      minValue = array[i];
    }
  }

  return minIndex; }

// Class representing the latent space
class LatentSpace {
  constructor(latent, parameters) {
    this.latent = latent
    this.parameters = parameters;
    this.kdtree = new kdTree(this.latent, distance, ["x", "y", "z"]);
    this.neighbors = 150;
    this.currentPath = null;
    this.pathCache = {};
  }

  getParamsGivenIndex(index) {
    return this.parameters[index]
  }

  getPointInfo(index) {
    return [this.latent[index], this.parameter[index]];
  }

  getIndexGivenLatent(latent) {
    const [distance, index] = this.kdtree.nearest(latent, this.neighbors);
    return index;
  }

  findNextPoint(aIndex, bIndex, path) {
    const [aLatent, aParam] = this.getPointInfo(aIndex);
    const [bLatent, bParam] = this.getPointInfo(bIndex);

    const latentDistance0 = distance(aLatent, bLatent);

    const distances = [];
    const indices = this.kdtree.nearest(aLatent, this.neighbors);
    const paramDistances = new Array(this.neighbors).fill(Number.MAX_VALUE);
    const latentDistances = new Array(this.neighbors).fill(Number.MAX_VALUE);
    const costValues = new Array(this.neighbors).fill(Number.MAX_VALUE);

    for (let i = 0; i < this.neighbors; i++) {
      const index = indices[i][1];
      if (index === bIndex) {
        return bIndex;
      }
      if (path.includes(index)) {
        continue;
      }

      const [kLatent, kParam] = this.getPointInfo(index);
      const paramDistanceToA = distanceParam(kParam, aParam);
      const latentDistanceToB = distance(bLatent, kLatent);

      paramDistances[i] = paramDistanceToA;
      latentDistances[i] = latentDistanceToB > latentDistance0 ? Number.MAX_VALUE : latentDistanceToB;
      costValues[i] = paramDistances[i] + latentDistances[i];
    }
    index_min = findIndexOfMinValue(costValues)
    return index_min
}
  calculateMeander(self, idx1, idx2) {
    let reachedGoal = false;
    const path = [idx1];
    let steps = 0;

    while (!reachedGoal) {
      steps++;

      if (steps > 1000) {
        return path;
      }

      const newPoint = self.findNextPoint(idx1, idx2, path);
      path.push(newPoint);
      idx1 = newPoint;

      if (newPoint === idx2) {
        reachedGoal = true;
        break;
      }
    }

    return path;
  }

  calculateCrossfade(aIndex, bIndex, time) {
    nSteps = 10 * t

    aParams = this.getParamsGivenIndex(aIndex)
    bParams = this.getParamsGivenIndex(bIndex)

    crossfade = []


    const interpolatedParameters = [];

    // Calculate the step size for each parameter
    const stepSizes = aParams.map((startParam, index) => {
      return (aParams[index] - startParam) / (nSteps - 1);
    });

    // Interpolate the parameters step by step
    for (let i = 0; i < nSteps; i++) {
      const interpolatedParams = [];
      for (let j = 0; j < startParameters.length; j++) {
        interpolatedParams.push(startParameters[j] + i * stepSizes[j]);
      }
      interpolatedParameters.push(interpolatedParams);
    }
    return interpolatedParameters;
  }
}