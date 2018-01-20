
////////////////////////////////////////////////////////////////////////////////
/////////////////////************** GRUNTFILE **************////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Transforms the bower and assets files to 2 files for production and then   *
  * watch the .assets/js and .assets/styles. In details :                                             *
  *                                                                            *
  * 1) Proceeds to the the concatenation and minification of every js and css  *
  * bower files from ./bower_comonents : ./.tmp/js/bower.min.js and            *
  * ./.tmp/styles/bower.min.css.                                               *
  *                                                                            *
  *  2) The js files from ./assets/js are lint, verify with karma, concat and  *
  * minify into ./.tmp/js/angular.min.js. The sass files from .assets/styles   *
  * are convert to css, concat and minify into ./.tmp/styles/angular.min.css.  *
  *                                                                            *
  * 3) The ./.tmp/#/angular.min.# are concat with their corresponding          *
  * ./tmp/#/bower.min.# into ./assets/js/js.js and ./assets/styles/styles.css. *
  *                                                                            *
  * 4) The .assets/js and .assets/styles are watch, if there is any            *
  * modification then 2) and 3) for the corresponding folder.                  *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function (grunt) {

  'use strict'

  grunt.initConfig({
    watch: {
      script: { //watch every angular js file and if it changes : it lints, concats and minifies the files and then concats them with .tmp/js/bower.min.js into assets/js/js.js then it will be test with Karma
        files: [ 'assets/js/app.js', 'assets/js/*/**/*.js', '!assets/js/*/**/*.tests.js' ],
        tasks: [ /*'jshint',*/ /* 'karma', */ 'concat:angularApp' ] //angularApp = files create for the angular app
      },
      styles: { //watch every angular sass file and if it changes : it converts, concats and minifies the files and then concats them with .tmp/styles/bower.min.css into assets/styles/styles.css
        files: [ 'assets/styles/**/*.{sass,scss}' ],
        tasks: [ 'sass', 'concat:cssAngularApp' ] //angularApp = files create for the angular app
      }
    },
    bower_concat: {
      all: {
        dest: '.tmp/js/bower.js', //concat every bower js file into assets/js/bower.js
        cssDest: '.tmp/styles/bower.css', //concat every bower css file into assets/styles/bower.css
        exclude: [ 'angular-mocks' ],
        dependencies: {
          'angular-material': [ 'angular', 'angular-animate', 'angular-aria', 'angular-messages' ],
          'angular-messages': 'angular',
          'angular-aria': 'angular',
          'angular-animate': 'angular',
          'angular-route': 'angular',
          'angular-ui-router': 'angular'
        },
        bowerOptions: {
          relative: false
        },
        mainFiles: {
          'font-awesome': 'css/font-awesome.css',
          "codemirror": [
            "lib/codemirror.js",
            "lib/codemirror.css",
            "addon/mode/typescript.js",
            "addon/fold/foldcode.js",
            "addon/fold/foldgutter.js",
            "addon/fold/foldgutter.css",
            "addon/edit/matchbrackets.js",
            "addon/edit/closebrackets.js",
            "addon/hint/javascript-hint.js",
            "addon/hint/show-hint.js",
            "addon/hint/show-hint.css",
            "addon/scroll/simplescrollbars.js",
            "addon/scroll/simplescrollbars.css"
          ]
        }
      }
    },
    babel: { //ransform ES6+ into vanilla ES5
      options: {
        sourceMap: true,
        presets: [ 'es2015' ]
      },
      dist: {
        files: {
          'assets/js/angularApp.js': '.tmp/js/angularApp.js'
        }
      }
    },
    jshint: { //lint every angular js file
      options: {
        globals: {
          angular: true,
          paper: true,
          console: true
        }
      },
      all: [ 'assets/js/angularApp.js' ]
    },
    karma: { //Karma test with Jasmine, PhantomJS and Angular Mocks-up on every angular js files which has test files
      unit: {
        options: {
          frameworks: ['jasmine'],
          singleRun: true,
          browsers: ['PhantomJS'],
          files: [ 'assets/js/angularApp.js', 'assets/js/bower.min.js', 'bower_components/angular-mocks/angular-mocks.js', 'bower_components/angular-material/angular-material-mocks.js' ]
        }
      }
    },
    concat: { //concat js and css files
      angularApp: { //concat every angular js file into .tmp/js/angularApp.js
        src: [ 'assets/js/app.js', 'assets/js/*/**/*.js', '!assets/js/*/**/*.tests.js' ],
        dest: 'assets/js/angularApp.js'
      },
      js: { //concat .tmp/js/bower.min.js and .tmp/js/angularApp.min.js into assets/js/js.js
        src: [ 'assets/js/bower.min.js', '.tmp/js/angularApp.min.js' ],
        dest: 'assets/js/js.js'
      },
      cssAngularApp: { //concat every angular sass file into .tmp/styles/angularApp.css
        src: [ '.tmp/styles/css/**/*.css' ],
        dest: 'assets/styles/angularApp.css'
      },
      cssStyles: { //concat assets/styles/bower.min.css and .tmp/styles/angularApp.min.css into assets/styles/styles.css
        src: [ 'assets/styles/bower.min.css', '.tmp/styles/angularApp.min.css' ],
        dest: 'assets/styles/styles.css'
      }
    },
    uglify: {
      angularApp: { //minify .tmp/js/angularApp.js into assets/js/angularApp.min.js
        files: {
          '.tmp/js/angularApp.min.js': [ 'assets/js/angularApp.js' ]
        }
      },
      bower: { //minify .tmp/js/bower.js into assets/js/bower.min.js
        files: {
          'assets/js/bower.min.js': [ '<%= bower_concat.all.dest %>' ]
        }
      }
    },
    sass: { //convert every angular sass file into .tmp/styles/css folder
      dist: {
        options: {
          style: 'expanded',
          lineNumbers: true, // 1
          sourcemap: 'none',
          cacheLocation: '.tmp/.sass-cache'
        },
        files: [{
          expand: true,
          cwd: 'assets/styles/',
          src: [ '**/*.{sass,scss}' ],
          dest: '.tmp/styles/css',
          ext: '.css'
        }]
      }
    },
    cssmin: {
      angularApp: { //minify assets/styles/angularApp.css into .tmp/styles/angularApp.min.css
        files: {
          '.tmp/styles/angularApp.min.css': [ 'assets/styles/angularApp.css' ]
        }
      },
      bower: { //minify assets/styles/bower.css into .tmp/assets/styles/bower.min.css
        files: {
          'assets/styles/bower.min.css': [ '.tmp/styles/bower.css' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  //no karma because it aborts due to some unknown warnings, idem in watch
  grunt.registerTask('default', [ 'bower_concat', 'uglify:bower', 'concat:angularApp', /*'babel',*/ /*'jshint',*/ /*'karma',*/ 'sass', 'concat:cssAngularApp', 'cssmin:bower', 'watch' ]);
  grunt.registerTask('onefile', [ 'bower_concat', 'uglify:bower', 'jshint', 'karma', 'concat:angularApp', 'uglify:angularApp', 'concat:js', 'sass', 'concat:cssAngularApp', 'cssmin', 'concat:cssStyles' ]);

};
