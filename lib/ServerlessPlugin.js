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
      if (layerHandler.hasNodeModules()) {
        layerHandler.emptyNodeModFilesPath();
        layerHandler.checkNodeModFilePaths();
        layerHandler.mkAwsDepSymLink();
      }
    }
    this.addExcludeNodeModulesPattern();
  }

  afterPackage() {
    for (const layerHandler of this._layers) {
      layerHandler.removeAwsNodeDeps();
    }
  }

  addExcludeNodeModulesPattern() {
    const extraPatterns = ["!node_modules", "nodejs/node_modules"];
    const patterns = this._serverless.service.package.patterns ?? [];
    this._serverless.service.package.patterns = [...patterns, ...extraPatterns];
  }
};
