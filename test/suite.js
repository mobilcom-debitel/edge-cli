var assert = require( 'assert' );

before( function () {

  describe.account = process.env.EDGE_CLI_TEST;

  describe.ok = function ( output ) {
    assert.ok( output.ok );
  };

  describe.not = function ( done ) {
    return function () {
      done( new Error( 'Should not be OK' ) );
    };
  };

} );
