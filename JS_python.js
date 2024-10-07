

// Class representing the latent space
class LatentSpace {
  constructor(dataset, dimensionality) {
    this.dimensionality = dimensionality;
    this.latent = dataset.reduced_latent_matrix.slice(0, dimensionality); // Assuming data structure
    this.parameter = dataset.parameter_matrix;
    this.kdtree = new kdTree(this.latent);
    this.currentIndex = null;
    this.currentLatentCoordinate = null;
    this.currentParameters = null;
    this.neighbors = 50;
    this.currentPath = null;
    this.pathCache = {};
  }

  // Play sound based on current parameters (implementation depends on your sound library)
  playBenjo() {
    // Replace this with your sound playing logic using the currentParameters
  }

  stopBenjo() {
    // Replace this with your sound stopping logic
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  setCurrentPoint(index) {
    this.currentIndex = index;
    this.currentLatentCoordinate = this.latent[index];
    this.currentParameters = this.parameter[index];
    this.playBenjo();
  }

  getPointInfo(index) {
    return [this.latent[index], this.parameter[index]];
  }

  getIndexGivenLatent(latent) {
    const [distance, index] = this.kdtree.nearestNeighbor(latent);
    return index;
  }

  // Pre-uniformization function (implementation might differ based on libraries)
  preUniformize() {
    // Replace this with your pre-uniformization logic based on your data structure
    return this.latent;
  }

  findNextPoint(a, b, path) {
    const [aLatent, aParam] = this.getPointInfo(a);
    const [bLatent, bParam] = this.getPointInfo(b);

    const paramDistance0 = this.calculateDistance(aParam, bParam);
    const latentDistance0 = this.calculateDistance(aLatent, bLatent);

    const distances = [];
    const indices = this.kdtree.nearestNeighbors(aLatent, this.neighbors);
    const paramDistances = new Array(this.neighbors).fill(Number.MAX_VALUE);
    const latentDistances = new Array(this.neighbors).fill(Number.MAX_VALUE);
    const costValues = new Array(this.neighbors).fill(Number.MAX_VALUE);

    for (let i = 0; i < this.neighbors; i++) {
      const index = indices[i][1];
      if (index === b) {
        return b;
      }
      if (path.includes(index)) {
        continue;
      }

      const [kLatent, kParam] = this.getPointInfo(index);
      const paramDistanceToA = this.calculateDistance(kParam, aParam);
      const latentDistanceToB = this.calculateDistance(bLatent, kLatent);

      paramDistances[i] = paramDistanceToA;
      latentDistances[i] = latentDistanceToB > latentDistance0 ? Number.MAX_VALUE : latentDistanceToB;
      costValues[i] = paramDistances[i] + latentDistances[i];
    }
}
}