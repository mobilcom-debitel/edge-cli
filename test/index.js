var assert = require( 'assert' );
var cli = require( '../' );

describe( 'The Edge CLI', function () {

  it( 'should report a missing action', function ( done ) {

    cli.dispatch( [] ).catch( function ( err ) {
      assert.equal( err.message, 'Missing action' );
      done();
    } ).catch( done );

  } );

  it( 'should allow configuration', function ( done ) {

    done();

  } );

} );
