var debug = require( 'debug' )( 'edge-cli:index' );
var dispatch = require( './lib/dispatch' );

var args = process.argv.slice( process.argv[ 0 ].match( /edge/ ) ? 1 : 2 );
debug( args );

dispatch( args ).catch( function ( err ) {
  console.error( err.message );
  debug( err.stack );
  usage();
  process.exit( 1 );
} );

function usage() {
  console.log( 'edge config <baseUrl> <user> <password>' );
  console.log( 'edge o/<org>/e/<env>/r' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name>' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name> upload <source>' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name> delete' );
}
