var assert = require( 'assert' );
var cli = require( '../' );
var debug = require( 'debug' )( 'edge-cli:test:unauthorized' );

require( './suite' );

describe( 'Using invalid credentials;', function () {

  this.timeout( 20000 );

  before( function ( done ) {
    cli.dispatch( [ 'account', 'get', describe.account ] )
      .then( function ( account ) {
        return cli.dispatch( [ 'account', 'setup',
          'mocha-invalid',
          account.url,
          account.username,
          'invalid',
          account.org,
          account.env
        ] );
      } )
      .then( describe.ok )
      .then( done, done );
  } );

  it( 'the resource controller should report 401', function ( done ) {

     cli.dispatch( [ 'resource', 'list', '-a', 'mocha-invalid' ] )
      .then( describe.not( done ), function ( err ) {
        debug( err.message );
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

  it( 'the proxy controller should report 401', function ( done ) {

     cli.dispatch( [ 'proxy', 'deploy', 'test/apiproxy', 'edge_cli_test', '-a', 'mocha-invalid' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

  it( 'the targetServer controller should report 401', function ( done ) {

     cli.dispatch( [ 'targetServer', 'list', '-a', 'mocha-invalid' ] )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /401/ ) );
      } )
      .then( done, done );

  } );

} );
