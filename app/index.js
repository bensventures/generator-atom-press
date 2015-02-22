'use strict';
var util = require('util'),
    diveSync = require('diveSync'),
    generators = require('yeoman-generator'),
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    rimraf = require('rimraf');


module.exports = generators.Base.extend({
  // The name `constructor` is important here
  constructor : function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);
  },
  initializing : {

  },
  prompting : function () {
    var done = this.async(),
        prompts = [
          {
            name: 'themename',
            message: 'What is the name of your theme?',
            default: 'My Theme'
          },
          {
            name: 'themeuri',
            message: 'What is the URL of your theme?',
            default: 'http://underscores.me'
          },
          {
            name: 'author',
            message: 'What is your name?',
            default: 'Automattic'
          },
          {
            name: 'authoruri',
            message: 'What is your URL?',
            default: 'http://automattic.com/'
          },
          {
            name: 'themedescription',
            message: 'Enter the theme description:',
            default: 'A starter theme based on _s'
          },
          {
            type: 'confirm',
            name: 'sassBootstrap',
            message: 'Would you like to include sass-bootstrap?',
            default: false
          }
        ];

    this.prompt(prompts, function (answers) {
      this.themename = answers.themename;
      this.themeuri = answers.themeuri;
      this.author = answers.author;
      this.authoruri = answers.authoruri;
      this.themedescription = answers.themedescription;
      this.sassBootstrap = answers.sassBootstrap;
      done();
    }.bind(this));
  },
  default : function () {
    this.themeId = this._.slugify('My Theme');
  },
  writing : {
    download : function (){
      var done = this.async();

      this.mkdir(this.themeId);
      this.themePath = this.destinationPath(this.themeId);

      this.log.info('Downloading & extracting ' + chalk.yellow('_s'));

      this.extract('https://github.com/Automattic/_s/archive/master.zip', this.themePath, function (){
        this.workingDirectory = this.themePath + '/_s-master';
        done();
      }.bind(this));
    },
    stampName : function (){
      diveSync(this.workingDirectory, function(err, file) {
        if (err) throw err;

        this._findAndReplace(file);
      }.bind(this));
      
      this.log.ok('Done replacing string ' + chalk.yellow('_s'));
    },
    baseThemeReady : function (){

      var done = this.async();

      this.log(chalk.yellow('Creating dev folders and files'));

      this.copy('_main.scss', this.themePath + '/css/sass/main.scss');
      this.copy('_theme.js', this.themePath + '/js/theme.js');
      this.copy('_package.json', this.themePath + '/build/package.json');
      this.copy('_bower.json', this.themePath + '/build/bower.json');
      this.copy('Gruntfile.js', this.themePath + '/build/Gruntfile.js');
      this.copy('_gitignore', this.themePath + '/.gitignore');

      if (this.sassBootstrap) {
        this.bowerInstall([ 'sass-bootstrap' ], { save: true });
      }

      this.directory(this.workingDirectory, this.themePath);
      
      rimraf(this.workingDirectory, done);
    }
  },
  _findAndReplace : function (file){
    
    var self = this,
        _ = this._,
        stat = fs.statSync(file);

    if (stat.isFile() && (path.extname(file) == '.php' || path.extname(file) == '.css')) {
      self.log.info('Find and replace _s in ' + chalk.yellow(file));
      var data = fs.readFileSync(file, 'utf8');
      var result;
      result = data.replace(/Text Domain: _s/g, "Text Domain: " + _.slugify(self.themename) + "");
      result = result.replace(/'_s'/g, "'" + _.slugify(self.themename) + "'");
      result = result.replace(/_s_/g, _.underscored(_.slugify(self.themename)) + "_");
      result = result.replace(/ _s/g, " " + self.themename);
      result = result.replace(/_s-/g, _.slugify(self.themename) + "-");

      if (file == 'style.css') {
        self.log.info('Updating theme information in ' + file);
        result = result.replace(/(Theme Name: )(.+)/g, '$1' + self.themename);
        result = result.replace(/(Theme URI: )(.+)/g, '$1' + self.themeuri);
        result = result.replace(/(Author: )(.+)/g, '$1' + self.author);
        result = result.replace(/(Author URI: )(.+)/g, '$1' + self.authoruri);
        result = result.replace(/(Description: )(.+)/g, '$1' + self.themedescription);
        result = result.replace(/(Version: )(.+)/g, '$10.0.1');
        result = result.replace(/(\*\/\n)/, '$1@import url("css/main.css");');
      }
      else if (file == 'footer.php') {
        self.log.info('Updating theme information in ' + file);
        result = result.replace(/http:\/\/automattic.com\//g, self.authoruri);
        result = result.replace(/Automattic/g, self.author);
      }
      else if (file == 'functions.php') {
        self.log.info('Updating theme information in ' + file);
        var themejs = "$1 wp_enqueue_script( '" + _.slugify(self.themename) + "-theme', get_template_directory_uri() . '/js/theme.js', array('jquery'), '0.0.1' );\n if (in_array($_SERVER['SERVER_ADDR'], ['127.0.0.1', '192.168.50.4']) || pathinfo($_SERVER['SERVER_NAME'], PATHINFO_EXTENSION) == 'dev') {\n wp_enqueue_script( 'livereload', '//localhost:35729/livereload.js', '', false, true );\n }\n $2"
        result = result.replace(/(get_stylesheet_uri\(\) \);\n)(\n.wp_enqueue_script\()/, themejs);
      }

      fs.writeFileSync(file, result, 'utf8');

    }
    else if (stat.isFile() && path.basename(file) == '_s.pot') {
      self.log.info('Renaming language file ' + chalk.yellow(file));
      fs.renameSync(file, path.join(path.dirname(file), _.slugify(self.themename) + '.pot'));
    }
    else if (stat.isFile() && path.basename(file) == 'README.md') {
      self.log.info('Updating ' + chalk.yellow(file));
      var data = fs.readFileSync(file, 'utf8');
      var result = data.replace(/((.|\n)*)Getting Started(.|\n)*/i, '$1');
      fs.writeFileSync(file, result, 'utf8');
    }
  }
});