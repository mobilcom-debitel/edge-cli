var fs = require( 'fs' );
var glob = require( 'glob' );
var crypto = require( 'crypto' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:proxyChecksum' );

module.exports = proxyChecksum;

function proxyChecksum( dir ) {
  debug( dir );
  return nfcall( glob, dir + '/**' ).then( function ( paths ) {
    return Promise.all( paths.filter( ignoreChecksum ).sort().map( pathChecksum ) );
  } ).then( function ( checksums ) {
    if ( checksums.length === 0 ) {
      throw new Error( 'Proxy is empty or directory does not exist' );
    }
    debug( checksums );
    return checksum( checksums.join( '.' ) );
  } );
}

function ignoreChecksum( path ) {
  return !path.match( /jsc\/checksum\.js$/ );
}

function pathChecksum( path ) {
  return nfcall( fs.readFile, path ).then( function ( contents ) {
    return checksum( path ) + ':' + checksum( contents );
  } ).catch( function ( err ) {
    if ( err.message.match( /EISDIR/ ) ) return checksum( path );
    throw err;
  } );
}

function checksum( data ) {
  var hash = crypto.createHash( 'sha256' );
  return hash.update( data, 'binary' ).digest( 'hex' );
}
