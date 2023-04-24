const { before } = require("mocha");
const ServerlessLayer = require("../../lib/ServerlessLayer");
const expect = require("chai").expect;
const fs = require("node:fs");
const path = require("node:path");
const timer = require("timers/promises");

describe("Serverless Layer with Nodejs", function () {
  const root = "/tmp/sls-layer/";

  before(function () {
    fs.rmSync(root, { recursive: true, force: true });
    fs.mkdirSync(path.resolve(root, "node_modules"), { recursive: true });
  });

  const sls = new ServerlessLayer(root);

  it("should return true that there is a node_modules folder", async function () {
    expect(sls.hasDependencies()).to.equal(true);
  });

  it('should create symbolic link to "nodejs/node_modules"', async function () {
    sls.mkAwsDepSymLink();

    await timer.setTimeout(1000);

    expect(
      fs.existsSync(path.resolve(root, "nodejs", "node_modules"))
    ).to.equal(true);
    expect(
      fs.statSync(path.resolve(root, "nodejs", "node_modules")).isDirectory()
    ).to.equal(true);
  });

  it('should remove the "node_modules" folder', async function () {
    sls.rmAwsDependencies();

    await timer.setTimeout(1000);

    expect(
      fs.existsSync(path.resolve(root, "nodejs", "node_modules"))
    ).to.equal(false);
    expect(fs.existsSync(path.resolve(root, "node_modules"))).to.equal(true);
    expect(fs.existsSync(path.resolve(root))).to.equal(true);
  });
});
