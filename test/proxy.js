var assert = require( 'assert' );
var cli = require( '../' );
var debug = require( 'debug' )( 'edge-cli:test:proxy' );

require( './suite' );

describe( 'The proxy controller', function () {

  this.timeout( 8000 );

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
        done();
      } );

  } );

  it( 'should report an error when the proxy directory is invalid (update)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'update', 'unknown', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        debug( err.message );
        assert.ok( err.message.match( /ENOENT/ ) );
        done();
      } );

  } );

  it( 'should undeploy a proxy and return the undeployed revisions', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'undeploy', 'edge_cli_test' ] )
      .then( function ( result ) {
        debug( result );
        assert.ok( result.revisions.length > 0 );
        done();
      } );

  } );

  it( 'should not fail when undeploying an undeployed proxy', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'undeploy', 'edge_cli_test' ] )
      .then( function ( result ) {
        debug( result );
        assert.equal( result.revisions.length, 0 );
        done();
      } );

  } );

} );
