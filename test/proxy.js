var assert = require( 'assert' );
var cli = require( '../' );
var debug = require( 'debug' )( 'edge-cli:test:proxy' );

require( './suite' );

describe( 'The proxy controller', function () {

  this.timeout( 8000 );

  var deployData;

  it( 'should deploy a proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'validate', 'test/apiproxy', 'edge_cli_test' ] )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test' ] );
      } )
      .then( describe.ok )
      .then( done, done );

  } );

  it( 'should update a proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'update', 'test/apiproxy', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( done, done );

  } );

  it( 'should report an error when the proxy directory is invalid (deploy)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'deploy', 'unknown', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /ENOENT/ ) );
      } )
      .then( done, done );

  } );

  it( 'should report an error when the proxy directory is invalid (update)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'update', 'unknown', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        debug( err.message );
        assert.ok( err.message.match( /ENOENT/ ) );
      } )
      .then( done, done );

  } );

  it( 'should undeploy a proxy and return the undeployed revisions', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'undeploy', 'edge_cli_test', 'test/redeploy.json' ] )
      .then( function ( result ) {
        debug( result );
        assert.equal( result.revisions.length, 1 );
        redeployData = result;
      } )
      .then( done, done );

  } );

  it( 'should redeploy a proxy and return the redeployed revisions', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'redeploy', 'edge_cli_test', 'test/redeploy.json' ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } )
      .then( done, done );

  } );

  it( 'should redeploy an already deployed proxy and return the redeployed revisions', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'redeploy', 'edge_cli_test', 'test/redeploy.json' ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } )
      .then( done, done );

  } );

  it( 'should undeploy a proxy and return the undeployed revisions (2)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'undeploy', 'edge_cli_test' ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } )
      .then( done, done );

  } );

  it( 'should not fail when undeploying an undeployed proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'undeploy', 'edge_cli_test' ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, { revisions: [] } );
      } )
      .then( done, done );

  } );

  it( 'should require a proxy name when deleting', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'remove' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Missing proxy' );
      } )
      .then( done, done );

  } );

  it( 'should remove a proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'remove', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( done, done );

  } );

  it( 'should deploy a proxy instead of trying to update a non-existing proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'update', 'test/apiproxy', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( done, done );

  } );

  it( 'should remove a proxy (2)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'remove', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( done, done );

  } );

  it( 'should remove a non-existing proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'remove', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( done, done );

  } );

} );
