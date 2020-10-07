const Generator = require("yeoman-generator");
const latestVersion = require('latest-version');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name",
        default: this.appname.replace(/\s+/g, '-') // Default to current folder name
      }
    ]);
  }

  async gettingInfos() {
    console.log("Fetching information...");

    // get cdk version (latest)....
    console.log(await latestVersion('@aws-cdk/core'));
  }

  wirting() {
    const { projectName } = this.answers;

    this.fs.copyTpl(
      this.templatePath('package.json.ejs'),
      this.destinationPath('package.json'),
      { projectName }
    );
  }
};
