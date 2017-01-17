var assert = require( 'assert' );
var cli = require( '../' );
var pack = require( '../package.json' );

require( './suite' );

describe( 'The Edge CLI', function () {

  this.timeout( 20000 );

  it( 'should report a missing action', function ( done ) {

    cli.dispatch( [] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ edge, ... ]', function ( done ) {

    cli.dispatch( [] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

  it( 'should return its version', function ( done ) {

    cli.dispatch( [ 'version' ] )
      .then( function ( response ) {
        assert.equal( response, pack.version );
      } )
      .then( done, done );

  } );

  it( 'should show a help document', function ( done ) {

    cli.dispatch( [ 'help' ] )
      .then( function ( response ) {
        assert.ok( response.match( 'edge account list' ) );
      } )
      .then( done, done );

  } );

} );
