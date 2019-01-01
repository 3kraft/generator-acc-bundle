'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const _ = require('lodash');
// Const extend = require('deep-extend');
const mkdirp = require('mkdirp');
const parseAuthor = require('parse-author');
const validatePackageName = require('validate-npm-package-name');

const BUNDLE_TYPE_APMIA_SCRIPT = 'apmia-script';
const BUNDLE_TYPE_JAVA_AGENT = 'java-agent';

module.exports = class extends Generator {
  /*  Constructor(args, options) {
    super(args, options);
  } */

  initializing() {
    // Load package.json from the current directory if it exists.
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage,
      repositoryName: this.options.repositoryName
    };

    if (this.options.name) {
      const name = this.options.name;
      const packageNameValidity = validatePackageName(name);

      if (packageNameValidity.validForNewPackages) {
        this.props.name = name;
      } else {
        throw new Error(
          packageNameValidity.errors[0] ||
            'The name option is not a valid npm package name.'
        );
      }
    }

    if (_.isObject(this.pkg.author)) {
      this.props.authorName = this.pkg.author.name;
      this.props.authorEmail = this.pkg.author.email;
      this.props.authorUrl = this.pkg.author.url;
    } else if (_.isString(this.pkg.author)) {
      const info = parseAuthor(this.pkg.author);
      this.props.authorName = info.name;
      this.props.authorEmail = info.email;
      this.props.authorUrl = info.url;
    }
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to ${chalk.red('generator-acc-bundle')} generator!`));

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Name of the ACC bundle extension',
        // Default to existing package name of current folder name.
        default: this.props.name || this.appname
      },
      {
        name: 'authorName',
        message: "Author's Name",
        when: !this.props.authorName,
        default: this.user.git.name(),
        store: true
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name of the ACC bundle extension',
        default: this.appname
      },
      {
        type: 'input',
        name: 'version',
        message:
          'Initial version for the bundle. Use semantic versioning to support autoincrementing version numbers.',
        default: '1.0.0'
      },
      {
        type: 'list',
        name: 'bundleType',
        message: 'Select a bundle type',
        choices: [
          { name: 'APMIA Script', value: BUNDLE_TYPE_APMIA_SCRIPT },
          { name: 'Java Agent', value: BUNDLE_TYPE_JAVA_AGENT }
        ]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  default() {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log(
        `Your extension must be inside a folder named ${
          this.props.name
        }\nI'll automatically create this folder.`
      );
      mkdirp(this.props.name);
      this.destinationRoot(this.destinationPath(this.props.name));
    }
  }

  writing() {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {
      name: this.props.name,
      version: this.props.version,
      description: this.props.description,
      homepage: this.props.homepage,
      scripts: {
        predist: 'npm version patch',
        postversion:
          'json -I -f src/metadata/bundle.json -e "this.version=\\"$npm_package_version\\""',
        dist:
          'mkdirp dist && cd src/ && bestzip ../dist/${npm_package_name}-${npm_package_version}.zip *' // eslint-disable-line no-template-curly-in-string
      },
      repository: this.props.repositoryName,
      devDependencies: {
        json: '^9.0.6',
        bestzip: '^2.1.2',
        mkdirp: '^0.5.1'
      }
    });

    pkg.keywords = pkg.keywords || [];
    this.log(pkg);

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('src/README.md'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('metadata/description.md'),
      this.destinationPath('src/metadata/description.md'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('metadata/installInstructions.md'),
      this.destinationPath('src/metadata/installInstructions.md'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('metadata/bundle-' + this.props.bundleType + '.json'),
      this.destinationPath('src/metadata/bundle.json'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('bundle-' + this.props.bundleType + '.properties'),
      this.destinationPath('src/bundle.properties'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('lib/README-' + this.props.bundleType + '.md'),
      this.destinationPath('src/lib/README.md')
    );
    if (this.props.bundleType === BUNDLE_TYPE_APMIA_SCRIPT) {
      this.fs.copyTpl(
        this.templatePath('lib/sample.pl'),
        this.destinationPath('src/lib/sample.pl'),
        this.props
      );
    } else if (this.props.bundleType === BUNDLE_TYPE_JAVA_AGENT) {
      this.fs.copyTpl(
        this.templatePath('directives/README.md'),
        this.destinationPath('src/directives/README.md'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('directives/toggles.pbd'),
        this.destinationPath('src/directives/toggles.pbd'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('directives/tracers.pbd'),
        this.destinationPath('src/directives/' + this.props.name + '.pbd'),
        this.props
      );
    }
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });
  }
};
