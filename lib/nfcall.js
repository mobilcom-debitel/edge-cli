module.exports = nfcall;

function nfcall( fn ) {
  var args = Array.prototype.slice.call( arguments, 1 );
  return new Promise( function ( resolve, reject ) {
    args.push( function ( err ) {
      if ( err ) return reject( err );
      var result = Array.prototype.slice.call( arguments, 1 );
      resolve( result.length <= 1 ? result[ 0 ] : result );
    } );
    fn.apply( undefined, args );
  } );
}
