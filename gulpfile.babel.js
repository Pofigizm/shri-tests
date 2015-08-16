import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {getShriData} from './data.js';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task( 'styles', () => {
  return gulp.src( 'app/styles/*.css' )
    .pipe( $.sourcemaps.init() )
    .pipe( $.autoprefixer( { browsers: [ 'last 1 version' ] } ) )
    .pipe( $.sourcemaps.write() )
    .pipe( gulp.dest( '.tmp/styles' ) )
    .pipe( reload( { stream: true } ) );
} );

gulp.task( 'html', [ 'styles' ], () => {
  const assets = $.useref.assets( { searchPath: [ '.tmp', 'app', '.' ] } );

  return gulp.src( 'app/*.html' )
    .pipe( assets )
    .pipe( $.if( '*.js', $.uglify() ) )
    .pipe( $.if( '*.css', $.minifyCss( { compatibility: '*' } ) ) )
    .pipe( assets.restore() )
    .pipe( $.useref() )
    .pipe( $.if( '*.html', $.minifyHtml( { conditionals: true, loose: true } ) ) )
    .pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'clean', del.bind( null, [ '.tmp', 'dist' ] ) );

gulp.task( 'serve', [ 'styles' ], () => {
  getShriData( () => {
    console.log( 'All data updated!' );
    browserSync( {
      notify: false,
      port: 9000,
      server: {
        baseDir: [ '.tmp', 'app' ],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    } );

    gulp.watch( [
      'app/*.html',
      'app/scripts/*.js',
      'app/scripts/*.json',
    ] ).on( 'change', reload );

    gulp.watch( 'app/styles/**/*.css', [ 'styles' ] );
  } );
} );

gulp.task( 'build', [ 'html' ], () => {
  return gulp.src( 'dist/**/*' ).pipe( $.size( { title: 'build', gzip: true } ) );
} );

gulp.task( 'default', [ 'clean' ], () => {
  gulp.start( 'build' );
} );
