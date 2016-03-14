var Q = require( 'q' );
var archiver = require( 'archiver' );
var debug = require( 'debug' )( 'edge-cli:zipDirectory' );

module.exports = zipDirectory;

function zipDirectory( directory, target ) {

  return Q.Promise( function ( resolve, reject ) {

    var archive = archiver( 'zip' );
    var resolved = false;

    archive.on( 'error', function ( err ) {
      debug( err );
      reject( err );
    } );
    archive.on( 'entry', function () {
      // resolve on first entry
      if ( !resolved ) {
        debug( 'resolved' );
        resolved = true;
        resolve( archive );
      }
    } );
    archive.directory( directory, target ).finalize();

  } );

}
