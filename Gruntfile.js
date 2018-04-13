/* global module:false */

require("es5-shim");
require("es6-shim");

module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-jasmine-nodejs");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks('grunt-svgstore');

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    webpack: {
      dist: require("./config/webpack/dist"),
      test: require("./config/webpack/test"),
      uncompressed: require("./config/webpack/uncompressed")
    },

    svgstore: {
      options: {
        prefix: '', // This will prefix each <g> ID
        formatting: {
          indent_size: 2
        },
        cleanup: true,
        cleanupdefs: true,
        svg: { // will add and override the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
          "xmlns:dc": "http://purl.org/dc/elements/1.1/",
          "xmlns:cc": "http://creativecommons.org/ns#",
          "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "xmlns:svg": "http://www.w3.org/2000/svg",
          "xmlns": "http://www.w3.org/2000/svg",
          "xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
          "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape"
        }
      },
      default: {
        files: {
          'src/icons/sir-trevor-icons.svg': ['public/images/icons/src/*.svg'],
        }
      }
    },

    svgstore: {
      options: {
        prefix: '', // This will prefix each <g> ID
        formatting: {
          indent_size: 2
        },
        cleanup: true,
        cleanupdefs: true,
        svg: { // will add and override the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
          "xmlns:dc": "http://purl.org/dc/elements/1.1/",
          "xmlns:cc": "http://creativecommons.org/ns#",
          "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "xmlns:svg": "http://www.w3.org/2000/svg",
          "xmlns": "http://www.w3.org/2000/svg",
          "xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
          "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape"
        }
      },
      default: {
        files: {
          'src/icons/sir-trevor-icons.svg': ['public/images/icons/src/*.svg'],
        }
      }
    },

    "webpack-dev-server": {
      start: {
        webpack: require("./config/webpack/dev"),
        keepalive: true,
        hot: true,
        contentBase: "./",
        inline: true,
        host: "localhost",
        port: 8080,
        disableHostCheck: true
      }
    },

    karma: {
      test: {
        configFile: "./config/karma.conf.js"
      }
    },

    jshint: require("./config/jshint.conf"),

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: "localhost"
        }
      }
    },

    jasmine_nodejs: {
      options: {
        specNameSuffix: "spec.js",
        useHelpers: false,
        stopOnFailure: false,
        reporters: {
          console: {
            colors: true,
            cleanStack: 1,
            verbosity: 1,
            listStyle: "flat",
            activity: true
          }
        }
      },
      test: {
        specs: ["spec/e2e/*.spec.js"]
      }
    },

    clean: {
      all: ["build/*.*"]
    }
  });

  grunt.registerTask('default', ['svgstore', 'webpack:uncompressed', 'webpack:dist']);
  grunt.registerTask('test', ['clean:all', 'jshint', 'karma', 'svgstore', 'test-integration']);
  grunt.registerTask('test-integration', ['webpack:test', 'connect', 'jasmine_nodejs']);
  grunt.registerTask('dev', ['svgstore', 'webpack-dev-server:start']);
  grunt.registerTask("default", ["webpack:uncompressed", "webpack:dist"]);

  grunt.registerTask("dev", ["webpack-dev-server:start"]);
};
