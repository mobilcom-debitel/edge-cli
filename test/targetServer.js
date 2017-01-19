var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The targetServer controller', function () {

  this.timeout( 50000 );

  it( 'should require an account', function () {

    return cli.dispatch( [ 'targetServer', 'deploy', 'test/edge_cli_test.xml', 'edge_cli_test' ] )
      .then( describe.fail )
      .catch( function ( err ) {
        assert.equal( err.message, 'Missing account' );
      } );

  } );

  it( 'should manage target servers', function ( done ) {

    cli.dispatch( [ 'targetServer', 'deploy', 'test/edge_cli_test.xml', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'targetServer', 'list', '-a', describe.account ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'targetServer', 'deploy', 'test/edge_cli_test.json', 'edge_cli_test', '-a', describe.account ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'targetServer', 'list', '-a', describe.account ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'targetServer', 'delete', 'edge_cli_test', '-a', describe.account ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'targetServer', 'list', '-a', describe.account ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

  it( 'should fail with invalid JSON', function ( done ) {

    cli.dispatch( [ 'targetServer', 'deploy', 'test/edge_cli_test_invalid.json', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Status 400' );
        assert.ok( JSON.stringify( err.payload ).match( /was expecting double-quote/ ) );
      } )
      .then( done, done );

  } );

  it( 'should fail with invalid XML', function ( done ) {

    cli.dispatch( [ 'targetServer', 'deploy', 'test/edge_cli_test_invalid.xml', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Status 400' );
        assert.ok( err.payload.match( /Unexpected close tag <\/TargetServerZ>/ ) );
      } )
      .then( done, done );

  } );

} );
