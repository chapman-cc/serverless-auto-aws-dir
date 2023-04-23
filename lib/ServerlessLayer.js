const path = require("node:path");
const fs = require("node:fs");

module.exports = class ServerlessLayer {
  static depPaths = {
    node: {
      native: "node_modules",
      aws: "nodejs",
    },
    python: {
      native: "lib",
      aws: "python",
    }
  }

  constructor(layerRoot) {
    this._layerRoot = layerRoot;
    this._depType = "node"
  }

  get depDir () {
    return path.resolve(this._layerRoot, ServerlessLayer.depPaths[this._depType].native);
  }

  get awsDir () {
    return path.resolve(this._layerRoot, ServerlessLayer.depPaths[this._depType].aws);
  }

  get awsDepDir () {
    const awsDir = ServerlessLayer.depPaths[this._depType].aws;
    const depDir = ServerlessLayer.depPaths[this._depType].native;
    return path.resolve(this._layerRoot, awsDir, depDir);
  }

  hasDependencies() {
    return (
      fs.existsSync(this.depDir) &&
      fs.lstatSync(this.depDir).isDirectory()
    );
  }

  rmAwsDependencies() {
    if (fs.existsSync(this.awsDir)) {
      fs.rmSync(this.awsDir, { recursive: true });
    }
  }

  checkDepType () {
    if (fs.existsSync(path.resolve(this._layerRoot, "node_modules"))) {
      this._depType = "node";
    }
    
    if (fs.existsSync(path.resolve(this._layerRoot, "lib"))) {
      this._depType = "python";
    }
    
    if (!this._depType) {
      throw new Error("No dependency found");
    }
  }


  async mkAwsDepSymLink() {
    fs.mkdir(this.awsDir, { recursive: true }, (err) => {
      if (err) throw err;
      fs.symlinkSync(this.depDir, this.awsDepDir, "junction");
    });
  }

};
