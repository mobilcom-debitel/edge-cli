var assert = require( 'assert' );
var proxyChecksum = require( '../lib/proxyChecksum' );
var fs = require( 'fs' );
var nfcall = require( '../lib/nfcall' );
var debug = require( 'debug' )( 'edge-cli:test:proxyChecksum' );

require( './suite' );

describe( 'The proxyChecksum function', function () {

  it( 'should compute proxy checksums', function ( done ) {

    // BEWARE these checksums are only valid if all files in test/apiproxy are LF-based
    // use "git config core.autocrlf input" to pull LF correctly
    var a = '56626df4b3cb0ecb5bd61cb65e0516c0de37e9ad87cedf9b35ad57be39ce3319';
    var b = '61dc8210d63572b607dd59cdb082929bb50c654937c798d479ebaf91c0682c1b';

    proxyChecksum( 'test/apiproxy' ).then( function ( checksum ) {

      debug( checksum );
      assert.equal( checksum, a );
      return nfcall( fs.writeFile, 'test/apiproxy/resources/jsc/checksum.js', checksum );

    } ).then( function () {

      return proxyChecksum( 'test/apiproxy' );

    } ).then( function ( checksum ) {

      debug( checksum );
      assert.equal( checksum, a );
      return nfcall( fs.unlink, 'test/apiproxy/resources/jsc/checksum.js' );

    } ).then( function () {

      return nfcall( fs.writeFile, 'test/apiproxy/resources/jsc/new.js', 'print( "lol" );' );

    } ).then( function () {

      return proxyChecksum( 'test/apiproxy' );

    } ).then( function ( checksum ) {

      debug( checksum );
      assert.equal( checksum, b );
      return nfcall( fs.unlink, 'test/apiproxy/resources/jsc/new.js' );

    } ).then( done, done );

  } );

} );
