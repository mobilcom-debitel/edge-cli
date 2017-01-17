var minimist = require( 'minimist' );
var help = require( './help' );
var version = require( './version' );
var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

var controllers = {
  account: require( './account' ),
  config: require( './config' ),
  generate: require( './generate' ),
  resource: require( './resource' ),
  targetServer: require( './targetServer' ),
  proxy: require( './proxy' )
};

function dispatch( argv ) {

  var args = minimist( argv );
  debug( args );

  return route( args ).catch( function ( err ) {
    debug( err.stack );
    debug( err.payload );
    throw err;
  } );

}

function route( args ) {

  var path = args._;
  var controller = path.shift();
  var action = path.shift();
  var account = args.account || args.a;

  if ( controller === 'help' ) return help();
  if ( controller === 'version' ) return version();

  if ( account ) {
    return withAccount( account ).then( function ( account ) {
      path.unshift( account );
      return runAction( controller, action, path );
    } );
  }

  return Promise.resolve().then( function () {
    return runAction( controller, action, path );
  } );

}

function withAccount( name ) {
  return controllers.account.get( name )
    .then( function ( account ) {
      debug( account.url );
      debug( account.user );
      debug( account.org + '/' + account.env );
      return account;
    } );
}

function runAction( name, action, path ) {
  var controller = controllers[ name ];

  if ( !controller || !controller[ action ] ) {
    throw new Error( 'Invalid action' );
  }

  return controller[ action ].apply( controller, path );
}
