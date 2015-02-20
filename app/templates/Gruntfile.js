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
        src : ['app/app.scss'],
        dest : 'app/css/app.css'
      },
      prod : {
        options : {
          style : 'compressed'
        },
        src : ['app/app.scss'],
        dest : 'dist/css/app.css'
      }
    },

    // watch for changes
    watch : {
      scss : {
        files : ['app/app.scss'],
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
          name : '../bootstrap',
          mainConfigFile : 'app/bootstrap.js',
          out : 'dist/<%= pkg.name %>.js',
          include : ['../bower_components/almond/almond.js']
        }
      }
    },

    copy : {
      main : {
        files : [
          // includes files within path
          {
            expand : true,
            src : [ '**', '!bower_components/**', '!js/**', '!*.js', '!*.scss'],
            cwd : 'app/',
            dest : 'dist/',
            filter : 'isFile'}
        ]
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

  grunt.registerTask( 'build', ['clean:dist', 'copy', 'sass:prod', 'requirejs:compile', 'toggle:dist'] );
};