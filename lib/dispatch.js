var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

var controllers = {
  config: require( './config' ),
  resources: require( './resources' ),
  targetServers: require( './targetServers' )
};

function dispatch( args ) {

  args.shift();
  if ( args[ 0 ] && args[ 0 ].match( /(^|[\/\\])edge$/ ) ) args.shift();

  return controllers.config.load()
    .then( function ( config ) {

      var name = args.shift();
      if ( !name ) throw new Error( 'Missing account' );

      var account = config.accounts[ name ] || {};
      account.name = name;

      debug( account.name );
      debug( account.url );
      debug( account.user );
      debug( account.org + '/' + account.env );

      var controller = controllers[ args.shift() ];
      var action = args.shift();

      if ( !controller || !action || !controller[ action ] ) {
        throw new Error( 'Invalid action' );
      }

      args.unshift( account );

      return controller[ action ].apply( controller, args );

    } ).catch( function ( err ) {

      debug( err.stack );
      throw err;

    } );

}
