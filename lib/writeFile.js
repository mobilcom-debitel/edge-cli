var Q = require( 'q' );
var Fs = require( 'fs' );
var debug = require( 'debug' )( 'edge-cli:writeFile' );

module.exports = writeFile;

function writeFile( path, contents ) {
  debug( path );
  return Q.nfcall( Fs.writeFile, path, contents );
}
