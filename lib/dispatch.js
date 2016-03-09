var minimist = require( 'minimist' );
var Q = require( 'q' );
var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

var account = require( './account' );
var config = require( './config' );

var controllers = {
  resource: require( './resource' ),
  targetServer: require( './targetServer' ),
  proxy: require( './proxy' )
};

function dispatch( argv ) {

  return Q().then( function () {

    argv.shift();
    if ( argv[ 0 ] && argv[ 0 ].match( /(^|[\/\\])edge$/ ) ) argv.shift();

    var args = minimist( argv );
    var path = args._;
    debug( args );

    var first = path.shift();
    var second = path.shift();

    if ( first === 'account' ) {
      if ( !account[ second ] ) throw new Error( 'Invalid action' );
      return account[ second ].apply( account, path );
    } else if ( first === 'config' ) {
      if ( !config[ second ] ) throw new Error( 'Invalid action' );
      return config[ second ].apply( config, path );
    }

    return account.get( first )
      .then( function ( account ) {

        if ( !account ) throw new Error( 'Unknown account' );

        debug( account.url );
        debug( account.user );
        debug( account.org + '/' + account.env );

        var controller = controllers[ second ];
        var action = path.shift();

        if ( !controller || !controller[ action ] ) {
          throw new Error( 'Invalid action' );
        }

        path.unshift( account );

        return controller[ action ].apply( controller, path );

      } );

  } ).catch( function ( err ) {

    debug( err.stack );
    throw err;

  } );
}
