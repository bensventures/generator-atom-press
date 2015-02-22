module.exports = function ( grunt )
{
  grunt.initConfig( {
    pkg : grunt.file.readJSON( 'package.json' ),

    // compile your sass
    sass : {
      dev : {
        options : {
          style : 'expanded'
        },
        src : ['../css/sass/main.scss'],
        dest : '../style.css'
      },
      prod : {
        options : {
          style : 'compressed'
        },
        src : ['../css/app.scss'],
        dest : '../style.css'
      }
    },

    // watch for changes
    watch : {
      scss : {
        files : ['../css/**/*'],
        tasks : [
          'sass:dev',
          'notify:scss'
        ],
        options : {
          livereload : true
        }
      }
    },
    // notify cross-OS
    notify : {
      scss : {
        options : {
          title : 'Grunt, grunt!',
          message : 'SCSS is all gravy'
        }
      },
      js : {
        options : {
          title : 'Grunt, grunt!',
          message : 'JS is all good'
        }
      }
    },

    requirejs : {
      compile : {
        options : {
          name : '../js/init',
          mainConfigFile : 'app/bootstrap.js',
          out : 'dist/<%= pkg.name %>.js',
          include : ['../bower_components/almond/almond.js']
        }
      }
    },

    // Show the correct script tag in the dist index.html instead of the requirejs one
    toggle : {
      dist : {
        options : {
          show : ['dist']
        },
        files : {
          'dist/index.html' : ['dist/index.html']
        }
      }
    },
    clean : {
      dist : {
        dot : false,
        src : ['dist/*']
      }
    }

  } );

  // Load NPM's via matchdep
  require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'build', [
    'clean:dist', 
    'copy', 
    'sass:prod', 
    'requirejs:compile', 
    'toggle:dist'
  ] );
};