var Q = require( 'q' );
var req = require( 'request' );
var debug = require( 'debug' )( 'edge-cli:streamedRequest' );

module.exports = streamedRequest;

function streamedRequest( options, stream ) {
  debug( { method: options.method, url: options.url } );

  return Q.Promise( function ( resolve, reject ) {

    var post = req( options );
    post.on( 'response', resolve ).on( 'error', reject );
    stream.pipe( post );

  } ).then( function ( response ) {

    var body = [];

    response.on( 'data', function ( chunk ) {
      body.push( chunk );
    } );

    return Q.Promise( function ( resolve, reject ) {
      response.on( 'end', function () {
        resolve( [ response, Buffer.concat( body ) ] );
      } ).on( 'error', reject );
    } );

  } );

}
