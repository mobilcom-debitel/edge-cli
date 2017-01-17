var assert = require( 'assert' );
var cli = require( '../' );
var fs = require( 'fs' );
var request = require( 'request' );
var nfcall = require( '../lib/nfcall' );
var spread = require( '../lib/spread' );
var debug = require( 'debug' )( 'edge-cli:test:proxy' );

require( './suite' );

describe( 'The proxy controller', function () {

  this.timeout( 20000 );

  var deployData;

  beforeEach( function () {
    return generateApiPolicy().then( describe.ok );
  } );

  afterEach( function () {
    return cleanup();
  } );

  it( 'should remove a proxy (0)', function () {

    return cli.dispatch( [ 'proxy', 'remove', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok );
      // .then( shouldNotRespond );

  } );

  it( 'should deploy a proxy', function () {

    return cli.dispatch( [ 'proxy', 'validate', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] )
      .then( function () {
        return cli.dispatch( [ 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] );
      } )
      .then( function ( result ) {
        assert.ok( result.ok );
        assert.ok( !result.skipped );
      } )
      .then( shouldRespond );

  } );

  it( 'should deploy an existing revision of a proxy by checksum', function () {

    return cli.dispatch( [ 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] )
      .then( function ( result ) {
        assert.ok( result.ok );
        assert.equal( result.skipped, 'checksum' );
      } )
      .then( shouldRespond );

  } );

  it( 'should skip updating a proxy if checksums are equal', function () {

    return cli.dispatch( [ 'proxy', 'update', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] )
      .then( function ( result ) {
        assert.ok( result.ok );
        assert.equal( result.skipped, 'checksum' );
      } )
      .then( shouldRespond );

  } );

  it( 'should deploy a new proxy revision', function () {

    return nfcall( fs.writeFile, 'test/apiproxy/resources/jsc/new.js', 'print( "lol" );' ).then( function () {

      return cli.dispatch( [ 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] );

    } ).then( function ( result ) {

      assert.ok( result.ok );
      assert.ok( !result.skipped );

    } ).then( shouldRespond );

  } );

  it( 'should update a proxy', function () {

    return nfcall( fs.writeFile, 'test/apiproxy/resources/jsc/new.js', 'print( "rofl" );' ).then( function () {

      return cli.dispatch( [ 'proxy', 'update', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] );

    } ).then( function ( result ) {

      assert.ok( result.ok );
      assert.ok( !result.skipped );

    } ).then( shouldRespond );

  } );

  it( 'should update a proxy revision', function () {

    return nfcall( fs.writeFile, 'test/apiproxy/resources/jsc/new.js', 'print( "rofl2" );' ).then( function () {

      return cli.dispatch( [ 'proxy', 'updateRevision', 'test/apiproxy', 'edge_cli_test', '2', '-a', describe.account ] );

    } ).then( function ( result ) {

      assert.ok( result.ok );
      assert.ok( !result.skipped );

    } ).then( shouldRespond );

  } );

  it( 'should bundle a proxy', function () {

    return cli.dispatch( [ 'proxy', 'bundle', 'test/apiproxy', 'test/bundle.zip', '-a', describe.account ] )
      .then( describe.ok );

  } );

  it( 'should download a proxy', function () {

    return cli.dispatch( [ 'proxy', 'download', 'edge_cli_test', '1', 'test/download.zip', '-a', describe.account ] )
      .then( describe.ok );

  } );

  it( 'should report an error when the proxy directory is invalid (deploy)', function () {

    return cli.dispatch( [ 'proxy', 'deploy', 'unknown', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.fail, function ( err ) {
        assert.ok( err.message.match( /empty or directory does not exist/ ) );
      } );

  } );

  it( 'should report an error when the proxy directory is invalid (update)', function () {

    return cli.dispatch( [ 'proxy', 'update', 'unknown', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.fail, function ( err ) {
        debug( err.message );
        assert.ok( err.message.match( /empty or directory does not exist/ ) );
      } );

  } );

  it( 'should undeploy a proxy and return the undeployed revisions', function () {

    return cli.dispatch( [ 'proxy', 'undeploy', 'edge_cli_test', 'test/redeploy.json', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.equal( result.revisions.length, 1 );
        redeployData = result;
      } );
      // .then( shouldNotRespond );

  } );

  it( 'should redeploy a proxy and return the redeployed revisions', function () {

    return cli.dispatch( [ 'proxy', 'redeploy', 'edge_cli_test', 'test/redeploy.json', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } )
      .then( shouldRespond );

  } );

  it( 'should redeploy an already deployed proxy and return the redeployed revisions', function () {

    return cli.dispatch( [ 'proxy', 'redeploy', 'edge_cli_test', 'test/redeploy.json', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } )
      .then( shouldRespond );

  } );

  it( 'should undeploy a proxy and return the undeployed revisions (2)', function () {

    return cli.dispatch( [ 'proxy', 'undeploy', 'edge_cli_test', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, redeployData );
      } );
      // .then( shouldNotRespond );

  } );

  it( 'should not fail when undeploying an undeployed proxy', function () {

    return cli.dispatch( [ 'proxy', 'undeploy', 'edge_cli_test', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.deepEqual( result, { revisions: [] } );
      } );
      // .then( shouldNotRespond );

  } );

  it( 'should require a proxy name when deleting', function () {

    return cli.dispatch( [ 'proxy', 'remove', '-a', describe.account ] )
      .then( describe.fail, function ( err ) {
        assert.equal( err.message, 'Missing proxy' );
      } );

  } );

  it( 'should remove a proxy', function () {

    return cli.dispatch( [ 'proxy', 'remove', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok );
      // .then( shouldNotRespond );

  } );

  it( 'should deploy a proxy instead of trying to update a non-existing proxy', function () {

    return cli.dispatch( [ 'proxy', 'update', 'test/apiproxy', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok )
      .then( shouldRespond );

  } );

  it( 'should remove a proxy (2)', function () {

    return cli.dispatch( [ 'proxy', 'remove', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok );
      // .then( shouldNotRespond );

  } );

  it( 'should remove a non-existing proxy', function () {

    return cli.dispatch( [ 'proxy', 'remove', 'edge_cli_test', '-a', describe.account ] )
      .then( describe.ok );

  } );

  it( 'should compute a local checksum', function () {

    return cli.dispatch( [ 'proxy', 'checksum', 'test/apiproxy', '-a', describe.account ] )
      .then( function ( result ) {
        debug( result );
        assert.ok( result );
      } );

  } );

  function shouldRespond( result ) {

    return nfcall( request, describe.url + '/edge_cli_test' ).then( spread( function ( res, body ) {
      assert.equal( res.statusCode, 500 );
      assert.ok( body.match( /siegmeyer/ ) );
    } ) ).then( function () {
      return nfcall( request, describe.url + '/edge_cli_test/api-docs' ).then( spread( function ( res, body ) {
        var api = JSON.parse( body );
        assert.equal( res.statusCode, 200 );
        assert.equal( api.info.title, 'Unicorns' );
      } ) );
    } ).then( function () {
      return result;
    } );

  }

  function shouldNotRespond( result ) {
    return nfcall( request, describe.url + '/edge_cli_test' ).then( spread( function ( res, body ) {
      assert.notEqual( res.statusCode, 500 );
      assert.ok( !body.match( /siegmeyer/ ) );
      return result;
    } ) );
  }

  function generateApiPolicy() {
    return cli.dispatch( [ 'generate', 'apiPolicy', 'test/swagger.yaml', 'test/apiproxy' ] );
  }

  function cleanup() {
    return Promise.all( [
      nfcall( fs.unlink, 'test/apiproxy/resources/jsc/api.js' ),
      nfcall( fs.unlink, 'test/apiproxy/policies/api.xml' ),
      nfcall( fs.unlink, 'test/apiproxy/resources/jsc/new.js' )
    ] ).then( function () {}, function () {} );
  }

} );
