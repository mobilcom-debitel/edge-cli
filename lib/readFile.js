var Q = require( 'q' );
var Fs = require( 'fs' );
var debug = require( 'debug' )( 'edge-cli:readFile' );

module.exports = readFile;

function readFile( path ) {
  debug( path );
  return Q.nfcall( Fs.readFile, path );
}
