var archiver = require( 'archiver' );
var proxyChecksum = require( './proxyChecksum' );
var debug = require( 'debug' )( 'edge-cli:proxyZip' );

module.exports = proxyZip;

function proxyZip( source ) {

  debug( source );

  // the Promise wrapper seems obsolete but is REQUIRED
  // otherwise promise chain breaks for some reason
  return Promise.resolve( proxyChecksum( source ).then( function ( checksum ) {

    debug( checksum );

    return archiver( 'zip' )
      .directory( source, 'apiproxy' )
      .append( checksum, { name: 'apiproxy/resources/jsc/checksum.js' } )
      .finalize();

  } ) );

}
