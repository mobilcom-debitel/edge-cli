var assert = require( 'assert' );
var cli = require( '../' );
var debug = require( 'debug' )( 'edge-cli:test:unauthorized' );

require( './suite' );

describe( 'Using invalid credentials;', function () {

  this.timeout( 20000 );

  before( function ( done ) {
    cli.dispatch( [ 'edge', 'account', 'get', describe.account ] )
      .then( function ( account ) {
        return cli.dispatch( [ 'edge', 'account', 'create',
          'mocha-invalid',
          account.url,
          account.user,
          'invalid',
          account.org,
          account.env
        ] );
      } )
      .then( describe.ok )
      .then( done, done );
  } );

  it( 'the resource controller should report 401', function ( done ) {

     cli.dispatch( [ 'edge', 'mocha-invalid', 'resource', 'list' ] )
      .then( describe.not( done ), function ( err ) {
        debug( err.message );
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

  it( 'the proxy controller should report 401', function ( done ) {

     cli.dispatch( [ 'edge', 'mocha-invalid', 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

  it( 'the targetServer controller should report 401', function ( done ) {

     cli.dispatch( [ 'edge', 'mocha-invalid', 'targetServer', 'list' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

} );
