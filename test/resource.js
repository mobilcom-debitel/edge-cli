var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The resource controller', function () {

  this.timeout( 20000 );

  it( 'should manage resources', function ( done ) {

    cli.dispatch( [ 'resource', 'deploy', 'test/edge_cli_test.jsc', 'jsc/edge_cli_test.js', '-a', describe.account ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'resource', 'list', '-a', describe.account ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'resource', 'delete', 'jsc/edge_cli_test.js', '-a', describe.account ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'resource', 'list', '-a', describe.account ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

} );
