var fs = require( 'fs' );
var path = require( 'path' );
var nfcall = require( './nfcall' );

module.exports = mkdirp;

function mkdirp( pat, mode ) {

  return nfcall( fs.stat, pat ).then( function ( stats ) {
    if ( !stats.isDirectory() ) throw new Error( pat + ' is not a directory' );
  } ).catch( function ( err ) {
    if ( err.message === pat + ' is not a directory' ) throw err;
    return mkdirp( path.dirname( pat ), mode ).then( function () {
      return nfcall( fs.mkdir, pat, mode );
    } );
  } );

}
