var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The targetServer controller', function () {

  this.timeout( 20000 );

  it( 'should manage target servers', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'targetServer', 'deploy', 'test/edge_cli_test.xml', 'edge_cli_test' ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'targetServer', 'deploy', 'test/edge_cli_test.json', 'edge_cli_test' ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'targetServer', 'delete', 'edge_cli_test' ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

} );
