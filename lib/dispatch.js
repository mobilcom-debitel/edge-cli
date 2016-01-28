var Q = require( 'q' );
var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var parsePath = require( './parsePath' );
var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

var handlers = {
  resource: require( './resource' ),
  target: require( './target' )
};

function dispatch( args ) {

  return readFile( './.edge' )
    .then( function ( config ) {
      return JSON.parse( config );
    } )
    .catch( function ( err ) {
      debug( err );
      return {};
    } )
    .then( function ( config ) {

      var action = args.shift();
      var remote, handler;

      if ( !action ) {

        throw new Error( 'Missing action' );

      } else if ( action.slice( 0, 2 ) === 'o/' ) {

        remote = parsePath( action );
        action = args.shift() || 'get';
        handler = handlers[ remote.type ];

        if ( !config.baseUrl || !config.user || !config.password ) {
          throw new Error( 'Missing configuration' );
        }

        if ( !handler ) {
          throw new Error( 'Invalid type (' + remote.type + '), add /r or /t' );
        }

      }

      switch ( action ) {
      case 'config':
        return writeFile( '.edge', JSON.stringify( {
          baseUrl: args.shift(),
          user: args.shift(),
          password: args.shift()
        } ) );

      case 'get':
        return handler.get( remote, config );

      case 'upload':
        return handler.upload( args.shift(), remote, config );

      case 'delete':
        return handler.del( remote, config );

      default:
        throw new Error( 'Invalid action (' + action + ')' );
      }

    } );

}
