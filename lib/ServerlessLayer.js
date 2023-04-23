const path = require("node:path");
const fs = require("node:fs");

module.exports = class ServerlessLayer {
  static depPaths = {
    node: {
      native: "node_modules",
      aws: "nodejs/node_modules",
    },
    node14: {
      native: "node_modules",
      aws: "nodejs/node14/node_modules",
    },
    node16: {
      native: "node_modules",
      aws: "nodejs/node16/node_modules",
    },
    node18: {
      native: "node_modules",
      aws: "nodejs/node18/node_modules",
    },
    python: {
      native: "lib",
      aws: "python/lib",
    },
  };
  constructor(layerRoot) {
    this._layerRoot = layerRoot;
    this._nodeModulesPath = path.resolve(this._layerRoot, "node_modules");
    this._awsNodeDepPath = path.resolve(
      this._layerRoot,
      "nodejs",
      "node_modules"
    );
    this._nodeModulesFilePaths = [];
  }

  get nodeModulesPath () {
    return path.resolve(this._layerRoot, "node_modules");
  }

  get awsNodejsPath () {
    return path.resolve(this._layerRoot, "nodejs");
  }

  get awsNodeDepPath () {
    return path.resolve(this._layerRoot, "nodejs", "node_modules");
  }

  hasNodeModules() {
    return (
      fs.existsSync(this._nodeModulesPath) &&
      fs.lstatSync(this._nodeModulesPath).isDirectory()
    );
  }

  removeAwsNodeDeps() {
    const nodejsPath = path.join(this._layerRoot, "nodejs");
    if (fs.existsSync(nodejsPath)) {
      fs.rmSync(nodejsPath, { recursive: true });
    }
  }

  checkNodeModFilePaths(pathLike = this._nodeModulesPath) {
    const files = fs.readdirSync(pathLike, { withFileTypes: true });
    for (const f of files) {
      f.name = path.join(pathLike, f.name);
      this._nodeModulesFilePaths.push(f);
      if (f.isDirectory()) {
        this.checkNodeModFilePaths(f.name);
      }
    }
  }
  emptyNodeModFilesPath() {
    this._nodeModulesFilePaths = [];
  }

  async mkAwsDepSymLink() {
    const nodejsPath = path.join(this._layerRoot, "nodejs");
    fs.mkdir(nodejsPath, { recursive: true }, (err) => {
      if (err) throw err;
      fs.symlinkSync(this._nodeModulesPath, this._awsNodeDepPath, "junction");
    });
  }

  copyNodeModulesFilesToAwsNodeDeps() {
    fs.mkdirSync(this._awsNodeDepPath, { recursive: true });

    for (const f of this._nodeModulesFilePaths) {
      if (f.isDirectory()) {
        fs.mkdirSync(f.name, { recursive: true });
      }

      if (f.isFile()) {
        const dest = f.name.replace(
          this._nodeModulesPath,
          this._awsNodeDepPath
        );
        fs.copyFileSync(f.name, dest);
      }
    }
  }
};
