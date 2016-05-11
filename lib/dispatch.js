var minimist = require( 'minimist' );
var Q = require( 'q' );
var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

var controllers = {
  account: require( './account' ),
  config: require( './config' ),
  resource: require( './resource' ),
  targetServer: require( './targetServer' ),
  proxy: require( './proxy' )
};

function dispatch( argv ) {

  argv.shift();
  if ( argv[ 0 ] && argv[ 0 ].match( /(^|[\/\\])edge$/ ) ) argv.shift();

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

  if ( controller && controller !== 'account' && controller !== 'config' ) {

    var account = controller;
    controller = action;
    action = path.shift();

    return withAccount( account )
      .then( function ( account ) {
        path.unshift( account );
        return runAction( controller, action, path );
      } );

  }

  return Q().then( function () {
    return runAction( controller, action, path );
  } );

}

function withAccount( name ) {
  return controllers.account.get( name )
    .then( function ( account ) {

      if ( !account ) throw new Error( 'Unknown account' );

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
