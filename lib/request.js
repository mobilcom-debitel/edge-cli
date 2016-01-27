var Q = require( 'q' );
var req = require( 'request' );
var debug = require( 'debug' )( 'edge-cli:request' );

module.exports = request;

function request( options, callback ) {
  debug( { method: options.method, url: options.url } );
  return Q.nfcall( req, options );
}
