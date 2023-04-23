"use strict";
const ServerlessLayer = require("./ServerlessLayer");

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this._serverless = serverless;
    this._options = options;
    this._layers = [];
    this.hooks = {
      "before:package:createDeploymentArtifacts": () => this.beforePackage(),
      "after:package:createDeploymentArtifacts": () => this.afterPackage(),
    };
  }

  beforePackage() {
    const layers = this._serverless.service.layers;
    for (const layer of Object.values(layers)) {
      const layerHandler = new ServerlessLayer(layer.path);
      this._layers.push(layerHandler);
      layerHandler.checkDepType();
      layerHandler.rmAwsDependencies();
      if (layerHandler.hasDependencies()) {
        layerHandler.mkAwsDepSymLink();
      }
    }
    this.addExcludeNodeModulesPattern();
  }

  afterPackage() {
    for (const layerHandler of this._layers) {
      layerHandler.rmAwsDependencies();
    }
  }

  addExcludeNodeModulesPattern() {
    const extraPatterns = ["!node_modules", "nodejs/node_modules", "!lib", "python/lib"];
    const patterns = this._serverless.service.package.patterns ?? [];
    this._serverless.service.package.patterns = [...patterns, ...extraPatterns];
  }
};
