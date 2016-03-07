var assert = require( 'assert' );
var cli = require( '../' );
var fs = require( 'fs' );
var readFile = require( '../lib/readFile' );
var writeFile = require( '../lib/writeFile' );

describe( 'The Edge CLI', function () {

  var account = process.env.EDGE_CLI_TEST;

  this.timeout( 20000 ); // dafuq apigee

  it( 'should report a missing action', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing account' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ edge, ... ]', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing account' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ node, edge, ... ]', function ( done ) {

    cli.dispatch( [ 'node', 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing account' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ node.exe, edge, ... ]', function ( done ) {

    cli.dispatch( [ 'C:\\foo\\bar\\node.exe', 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing account' );
      } )
      .then( done, done );

  } );

  it( 'should manage target servers', function ( done ) {

    cli.dispatch( [ 'edge', account, 'targetServer', 'deploy', 'test/edge_cli_test.xml', 'edge_cli_test' ] )
      .then( ok )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'targetServer', 'deploy', 'test/edge_cli_test.json', 'edge_cli_test' ] );
      } )
      .then( ok )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'targetServer', 'delete', 'edge_cli_test' ] );
      } )
      .then( ok )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'targetServer', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

  it( 'should manage resources', function ( done ) {

    cli.dispatch( [ 'edge', account, 'resource', 'deploy', 'test/edge_cli_test.jsc', 'jsc/edge_cli_test.js' ] )
      .then( ok )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'resource', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'resource', 'delete', 'jsc/edge_cli_test.js' ] );
      } )
      .then( ok )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'resource', 'list' ] );
      } )
      .then( function ( list ) {
        assert.ok( !list.match( /jsc\/edge_cli_test/ ) );
      } )
      .then( done, done );

  } );

  it( 'should deploy a proxy', function ( done ) {

    cli.dispatch( [ 'edge', account, 'proxy', 'validate', 'test/apiproxy', 'edge_cli_test' ] )
      .then( function () {
        return cli.dispatch( [ 'edge', account, 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test' ] );
      } )
      .then( ok )
      .then( done, done );

  } );

  describe( '(with mock account)', function () {

    it( 'should report a missing org', function ( done ) {

      cli.dispatch( [ 'edge', 'mrx', 'targetServer', 'list' ] )
        .then( not( done ), function ( err ) {
          assert.equal( err.message, 'Missing organization' );
        } )
        .then( done, done );

    } );

    it( 'should configure', function ( done ) {

      cli.dispatch( [ 'edge', 'mocha', 'config', 'set', 'url', 'foo' ] )
        .then( ok )
        .then( function () {
          return cli.dispatch( [ 'edge', 'mocha', 'config', 'get', 'url' ] );
        } )
        .then( function ( url ) {
          assert.equal( url, 'foo' );
        } )
        .then( done, done );

    } );

  } );

  function ok( output ) {
    assert.equal( output, 'OK' );
  }

  function not( done ) {
    return function () {
      done( new Error( 'Should not be OK' ) );
    };
  }

} );
