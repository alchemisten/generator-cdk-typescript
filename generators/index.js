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
      },
      {
        type: 'checkbox',
        name: 'resources',
        message: 'Which aws resources you want to use?',
        choices: [{
          name: 'Lambdas',
          value: 'lambda',
          checked: false
        }, {
          name: 'DynamoDB',
          value: 'dynamodb',
          checked: false
        }, {
          name: 'Simple Cloud Storage (S3)',
          value: 's3',
          checked: false
        },{
          name: 'Simple Queue Service (SQS)',
          value: 'sqs',
          checked: false
        },{
          name: 'Certificate Manager',
          value: 'certificate',
          checked: false
        },{
          name: 'API Gateway',
          value: 'api',
          checked: false
        },
        ]
      },
    ]);
  }

  async gettingInfos() {
    console.log("Fetching information...");
    console.log(this.answers);
  }

  writing() {
    const { projectName, resources } = this.answers;
    const cdkJsonContext = createCdkJsonContext(resources);

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
        this.templatePath('tsconfig.json'),
        this.destinationPath('tsconfig.json'),
    );

    this.fs.copyTpl(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore'),
    );

    this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
    );

    this.fs.copyTpl(
        this.templatePath('jest.config.js'),
        this.destinationPath('jest.config.js'),
    );

    this.fs.copyTpl(
        this.templatePath('cdk.json.ejs'),
        this.destinationPath('cdk.json'),
        { projectNameLispCase, resources, cdkJsonContext }
    );

    this.fs.copyTpl(
        this.templatePath('cdk-stack/bin/cdk.ts.ejs'),
        this.destinationPath(`cdk-stack/bin/${projectNameLispCase}.ts`),
        { projectName, projectNameLispCase }
    );

    this.fs.copyTpl(
        this.templatePath('cdk-stack/lib/stack.ts.ejs'),
        this.destinationPath(`cdk-stack/lib/${projectNameLispCase}-stack.ts`),
        { projectName, resources }
    );

    resources.includes('lambda') && this.fs.copyTpl(
        this.templatePath('src/lambdas/example-lambda/index.ts.ejs'),
        this.destinationPath(`src/lambdas/example-lambda/index.ts`),
    );

    resources.includes('lambda') && this.fs.copyTpl(
        this.templatePath('src/lambdas/tsconfig.json'),
        this.destinationPath(`src/lambdas/tsconfig.json`),
    );

    resources.includes('lambda') && this.fs.copyTpl(
        this.templatePath('src/lambdas/shared/response.ts'),
        this.destinationPath(`src/lambdas/shared/response.ts`),
    );

    resources.includes('lambda') && this.fs.copyTpl(
        this.templatePath('src/lambdas/shared/constants.ts'),
        this.destinationPath(`src/lambdas/shared/constants.ts`),
    );

    resources.includes('api') && this.fs.copyTpl(
        this.templatePath('cdk-stack/lib/constructs/api.ts.ejs'),
        this.destinationPath(`cdk-stack/lib/constructs/${projectNameLispCase}-api.ts.ejs`),
        { projectName, projectNameLispCase }
    );

    resources.includes('api') && this.fs.copyTpl(
        this.templatePath('cdk-stack/lib/utils.ts'),
        this.destinationPath(`cdk-stack/lib/utils.ts`),
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

const createCdkJsonContext = (resources) => {
  const contextArr = {
    'dynamodb': '"@db:example-table": "example-table"',
    's3': '"@s3:example-assets": "example-assets"',
    'sqs': '"example_queue_name": "example-queue-name"',
    'certificate': '"example_certificate": "arn:aws:acm:us-east-1:XXXXXXXXX:certificate/03a94885-481b-442c-97d6-e69587ba48ef"',
  }

  let contextStr = '';

  resources.forEach((resource, index) => {
    if(resource in contextArr) {
      contextStr += contextArr[resource] + ',';
      if(resources.length > 1 && resources.length - 1 !== index) {
        contextStr += '\n    ';
      }
    }
  })

  return contextStr;
}

