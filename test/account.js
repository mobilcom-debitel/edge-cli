var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'The account controller', function () {

  it( 'should manage accounts', function ( done ) {

    cli.dispatch( [ 'edge', 'account', 'set', 'mocha', 'a', 'b', 'c', 'd', 'e' ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', 'account', 'list' ] );
      } )
      .then( function ( accounts ) {
        assert.deepEqual( accounts.mocha, {
          url: 'a',
          user: 'b',
          password: 'c',
          org: 'd',
          env: 'e'
        } );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', 'account', 'get', 'mocha' ] );
      } )
      .then( function ( account ) {
        assert.deepEqual( account, {
          url: 'a',
          user: 'b',
          password: 'c',
          org: 'd',
          env: 'e'
        } );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', 'account', 'create', 'mocha', 'a', 'b', 'c', 'd' ] );
      } )
      .then( describe.not( done ) )
      .catch( function ( err ) {
        assert.ok( err.message.match( /Missing one of/ ) );
      } )
      .then( function () {
        return cli.dispatch( [ 'edge', 'account', 'delete', 'mocha' ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', 'account', 'get', 'mocha' ] );
      } )
      .then( function ( account ) {
        assert.equal( account, undefined );
      } ).then( done, done );

  } );

  it( 'should report an unknown account', function ( done ) {

    cli.dispatch( [ 'edge', 'unk', 'targetServer', 'list' ] )
      .then( describe.not( done ), function ( err ) {
        assert.equal( err.message, 'Unknown account' );
      } )
      .then( done, done );

  } );

} );
