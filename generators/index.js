const Generator = require("yeoman-generator");
const latestVersion = require('latest-version');
const fs = require('fs');
const path = require('path');

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
        validate: function(projectName){
          const isPascalCase = /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(projectName);
          if(!isPascalCase) {
            return "Your project name must be specified in PascalCase!";
          }
          return true;
        }
      }
    ]);
  }

  async gettingInfos() {
    console.log("Fetching information...");

    // get cdk version (latest)....
    console.log(await latestVersion('@aws-cdk/core'));
  }

  writing() {
    const { projectName } = this.answers;

    const projectNameLispCase = projectName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
        .toLowerCase();

    this.fs.copyTpl(
      this.templatePath('package.json.ejs'),
      this.destinationPath('package.json'),
      { projectName, projectNameLispCase }
    );

    this.fs.copyTpl(
        this.templatePath('cdk-stack/bin/cdk.ts.ejs'),
        this.destinationPath(`cdk-stack/bin/${projectNameLispCase}.ts`),
        { projectName, projectNameLispCase }
    );

    this.fs.copyTpl(
        this.templatePath('cdk-stack/lib/stack.ts.ejs'),
        this.destinationPath(`cdk-stack/lib/${projectNameLispCase}-stack.ts`),
        { projectName }
    );
  }

  installingDevDependencies() {
    this.yarnInstall(['@aws-cdk/assert'], { 'dev': true });
    this.yarnInstall(['@types/jest'], { 'dev': true });
    this.yarnInstall(['@types/node'], { 'dev': true });
    this.yarnInstall(['aws-cdk'], { 'dev': true });
    this.yarnInstall(['aws-lambda'], { 'dev': true });
    this.yarnInstall(['axios'], { 'dev': true });
    this.yarnInstall(['babel-jest'], { 'dev': true });
    this.yarnInstall(['jest'], { 'dev': true });
    this.yarnInstall(['jsonwebtoken'], { 'dev': true });
    this.yarnInstall(['jwk-to-pem'], { 'dev': true });
    this.yarnInstall(['source-map-support'], { 'dev': true });
    this.yarnInstall(['ts-jest'], { 'dev': true });
    this.yarnInstall(['ts-node'], { 'dev': true });
    this.yarnInstall(['typescript'], { 'dev': true });
  }

  installingDependencies() {
    this.yarnInstall(['@aws-cdk/core']);
    this.yarnInstall(['@types/aws-lambda']);
    this.yarnInstall(['aws-sdk']);
    this.yarnInstall(['cdkdx']);
  }
};
