var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The Edge CLI', function () {

  // dafuq apigee
  this.timeout( 20000 );

  it( 'should report a missing action', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ edge, ... ]', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ node, edge, ... ]', function ( done ) {

    cli.dispatch( [ 'node', 'edge' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ node.exe, edge, ... ]', function ( done ) {

    cli.dispatch( [ 'C:\\foo\\bar\\node.exe', 'edge' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Invalid action' );
      } )
      .then( done, done );

  } );

} );
