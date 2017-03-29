var minimist = require( 'minimist' );

var help = require( './help' );
var version = require( './version' );

var AccountController = require( './AccountController' );
var ConfigController = require( './ConfigController' );
var GenerateController = require( './GenerateController' );
var ProxyController = require( './ProxyController' );
var ResourceController = require( './ResourceController' );
var TargetServerController = require( './TargetServerController' );
var ProductController = require( './ProductController' );

var debug = require( 'debug' )( 'edge-cli:dispatch' );

module.exports = dispatch;

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

  var configController = new ConfigController( args.config || args.c );
  var accountController = new AccountController( configController );

  var path = args._;
  var controllerName = path.shift();
  var actionName = path.shift();
  var accountName = args.account || args.a;

  if ( controllerName === 'help' ) return help();
  if ( controllerName === 'version' ) return version();

  return ( accountName ? accountController.get( accountName ) : Promise.resolve() )
    .then( function ( account ) {

      debug( account );

      var controllers = {
        account: accountController,
        config: configController,
        generate: new GenerateController(),
        resource: new ResourceController( account ),
        targetServer: new TargetServerController( account ),
        proxy: new ProxyController( account ),
        product: new ProductController( account )
      };

      var controller = controllers[ controllerName ];

      if ( !controller || !controller[ actionName ] ) {
        throw new Error( 'Invalid action' );
      }

      return controller[ actionName ].apply( controller, path );

    } );

}
