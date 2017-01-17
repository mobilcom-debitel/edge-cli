var fs = require( 'fs' );

module.exports = help;

function help() {
  return new Promise( function ( resolve, reject ) {
    fs.readFile( __dirname + '/../README.md', function ( err, buffer ) {
      return err ? reject( err ) : resolve( buffer );
    } );
  } ).then( function ( buffer ) {
    return buffer.toString( 'utf-8' ).match( /```([\s\S]*?)```/ )[ 1 ];
  } );
}
