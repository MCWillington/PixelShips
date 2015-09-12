module.exports = function(grunt) {

  grunt.initConfig({
    pkg: {
      name: 'pixelships'
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'src/Class.js',
          'src/PhysicalObject.js',
          'src/Particle.js',
          'src/HomingParticle.js',
          'src/Bullet.js',
          'src/PixelShip.js',
          'src/AI.js',
          'src/ArrowKeyHandler.js',
          'src/Main.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        compress: true
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    htmlmin: {                                     // Task
    dist: {                                      // Target
      options: {                                 // Target options
        removeComments: true,
        collapseWhitespace: true,
        useShortDoctype: true,
        minifyCSS: true
      },
      files: {                                   // Dictionary of files
        'dist/index.html': 'src/index.html',     // 'destination': 'source'
        'dist/contact.html': 'src/contact.html'
      }
    },
    dev: {                                       // Another target
      files: {
        'dist/index.html': 'src/index.html',
        'dist/contact.html': 'src/contact.html'
      }
    }
  }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  grunt.registerTask('default', ['concat', 'uglify', 'htmlmin']);

};