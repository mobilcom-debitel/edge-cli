var assert = require( 'assert' );
var cli = require( '../' );
var fs = require( 'fs' );
var readFile = require( '../lib/readFile' );
var writeFile = require( '../lib/writeFile' );

describe( 'The Edge CLI', function () {

  it( 'should report a missing action', function ( done ) {

    cli.dispatch( [] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ edge, ... ]', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing action' );
      } )
      .then( done, done );

  } );

  it( 'should work when called with argv = [ node, edge, ... ]', function ( done ) {

    cli.dispatch( [ 'edge' ] )
      .then( not( done ), function ( err ) {
        assert.equal( err.message, 'Missing action' );
      } )
      .then( done, done );

  } );

  describe( '(without config)', function () {

    var restore;

    before( function ( done ) {

      readFile( './.edge' )
        .then( function ( contents ) {
          restore = contents;
          fs.unlink( './.edge', done() );
        }, done );

    } );

    it( 'should report a missing URL', function ( done ) {

      cli.dispatch( [ 'o/uhm/r' ] )
        .then( not( done ), function ( err ) {
          assert.equal( err.message, 'Missing configuration: url' );
        } )
        .then( done, done );

    } );

    it( 'should configure', function ( done ) {

      cli.dispatch( [ 'config', 'url', 'foo' ] )
        .then( ok )
        .then( function () {
          return cli.dispatch( [ 'config', 'url' ] );
        } )
        .then( function ( url ) {
          assert.equal( url, 'foo' );
        } )
        .then( done, done );

    } );

    after( function ( done ) {
      writeFile( './.edge', restore ).then( done, done );
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
