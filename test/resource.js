var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The resource controller', function () {

  this.timeout( 20000 );

  it( 'should manage resources', function ( done ) {

    cli.dispatch( [ 'edge', describe.account, 'resource', 'deploy', 'test/edge_cli_test.jsc', 'jsc/edge_cli_test.js' ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'resource', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'resource', 'delete', 'jsc/edge_cli_test.js' ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', describe.account, 'resource', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

} );
