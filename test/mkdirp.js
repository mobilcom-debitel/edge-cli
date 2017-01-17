var assert = require( 'assert' );
var mkdirp = require( '../lib/mkdirp' );
var fs = require( 'fs' );
var path = require( 'path' );
var nfcall = require( '../lib/nfcall' );

describe( 'The mkdirp function', function () {

  it( 'should mkdir recursively (existing)', function () {
    return mkdirp( 'test/apiproxy' );
  } );

  it( 'should mkdir recursively (fresh)', function () {
    var fresh = 'test/' + Math.random() + '/' + Math.random();
    return mkdirp( fresh ).then( function () {
      return nfcall( fs.rmdir, fresh );
    } ).then( function () {
      return nfcall( fs.rmdir, path.dirname( fresh ) );
    } );
  } );

  it( 'should fail if the file exists', function () {
    return mkdirp( 'test/mkdirp.js' ).then( describe.fail, function ( err ) {
      assert.ok( err.message.match( /is not a directory/ ) );
    } );
  } );

} );
