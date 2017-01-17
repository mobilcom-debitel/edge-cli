var assert = require( 'assert' );

before( function () {

  describe.account = process.env.ACCOUNT;
  describe.url = process.env.URL;

  describe.ok = function ( output ) {
    assert.ok( output.ok );
  };

  describe.not = function ( done ) {
    return function () {
      done( new Error( 'Should not be OK' ) );
    };
  };

  describe.fail = function ( done ) {
    throw new Error( 'Should fail' );
  };

} );
