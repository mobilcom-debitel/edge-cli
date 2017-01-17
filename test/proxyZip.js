var assert = require( 'assert' );
var fs = require( 'fs' );
var http = require( 'http' );
var proxyZip = require( '../lib/proxyZip' );
var request = require ( 'request' );
var nfcall = require( '../lib/nfcall' );
var spread = require( '../lib/spread' );
var debug = require( 'debug' )( 'edge-cli:test:proxyZip' );

require( './suite' );

describe( 'The proxyZip function', function () {

  this.timeout( 20000 );

  it( 'should create an archive streamable to a file', function ( done ) {

    proxyZip( 'test/apiproxy' ).then( function ( zip ) {
      zip.pipe( fs.createWriteStream( 'test/proxyZip.zip' ) );
      zip.on( 'end', done );
    } );

  } );

  it( 'should create a streamable archive', function ( done ) {

    var server = http.createServer( function ( req, res ) {
      req.pipe( fs.createWriteStream( 'test/proxyZip2.zip' ) ).on( 'finish', function () {
        res.end( 'Ok' );
      } );
    } ).listen( 8095 );

    proxyZip( 'test/apiproxy' ).then( function ( zip ) {
      return nfcall( request, {
        url: 'http://localhost:8095',
        method: 'POST',
        body: fs.createReadStream( 'test/proxyZip.zip' )
      } );
    } ).then( spread( function ( response, body ) {
      assert.equal( body.toString( 'utf-8' ), 'Ok' );
    } ) ).then( done, done );

  } );

} );
