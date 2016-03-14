var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The proxy controller', function () {

  this.timeout( 20000 );

  it( 'should report an error when the proxy directory is invalid (deploy)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'deploy', 'apiproxy', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /Invalid proxy directory/ ) );
      } )
      .then( done, done );

  } );

  it( 'should report an error when the proxy directory is invalid (update)', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'proxy', 'update', 'apiproxy', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /Invalid proxy directory/ ) );
      } )
      .then( done, done );

  } );

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

} );
