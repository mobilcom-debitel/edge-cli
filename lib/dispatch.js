var assign = require( 'object-assign' );
var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var parsePath = require( './parsePath' );
var configAction = require( './config' );
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

      if ( process.env.EDGE_URL ) config.url = process.env.EDGE_URL;
      if ( process.env.EDGE_USER ) config.user = process.env.EDGE_USER;
      if ( process.env.EDGE_PASSWORD ) config.password = process.env.EDGE_PASSWORD;

      var action = args.shift();
      var remote, handler;

      if ( !action ) {

        throw new Error( 'Missing action' );

      } else if ( action.slice( 0, 2 ) === 'o/' ) {

        remote = parsePath( action );
        action = args.shift() || 'get';
        handler = handlers[ remote.type ];

        if ( !config.url ) {
          throw new Error( 'Missing configuration: URL' );
        }

        if ( !config.user ) {
          throw new Error( 'Missing configuration: User' );
        }

        if ( !config.password ) {
          throw new Error( 'Missing configuration: Password' );
        }

        if ( !handler ) {
          throw new Error( 'Invalid type (' + remote.type + '), add /r or /t' );
        }

      }

      switch ( action ) {
      case 'config':
        return configAction( args.shift(), args.shift() );

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
