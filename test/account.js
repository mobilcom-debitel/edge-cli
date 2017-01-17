var assert = require( 'assert' );
var path = require( 'path' );
var child = require( 'child_process' );
var cli = require( '../' );

require( './suite' );

describe( 'The account controller', function () {

  it( 'should require an account name', function () {

    return cli.dispatch( [ 'account', 'setup' ] )
      .catch( function ( err ) {
        assert.equal( err.message, 'Missing account name' );
      } );

  } );

  it( 'should create an account', function () {

    return cli.dispatch( [ 'account', 'setup', 'mocha', 'a', 'b', 'c', 'd', 'e' ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'account', 'list' ] );
      } )
      .then( function ( accounts ) {
        assert.deepEqual( accounts.mocha, {
          url: 'a',
          username: 'b',
          password: 'c',
          org: 'd',
          env: 'e'
        } );
      } )
      .then( function () {
        return cli.dispatch( [ 'account', 'get', 'mocha' ] );
      } )
      .then( function ( account ) {
        assert.deepEqual( account, {
          url: 'a',
          username: 'b',
          password: 'c',
          org: 'd',
          env: 'e'
        } );
      } );

  } );

  this.timeout( 10000 );

  it( 'should setup an account interactively', function ( done ) {

    var bin = path.join( __dirname, '../bin', 'edge' );
    var c = child.spawn( 'node', [ bin, 'account', 'setup', 'mocha' ], { stdio: 'pipe' } );

    function write( n ) {
      setTimeout( function () {
        c.stdin.write( n + '\n' );
      }, 1000 + n * 100 );
    }

    write( 1 );
    write( 2 );
    write( 3 );
    write( 4 );
    write( 5 );

    setTimeout( function () {
      cli.dispatch( [ 'account', 'get', 'mocha' ] )
        .then( function ( account ) {
          assert.deepEqual( account, {
            url: '1',
            username: '2',
            password: '3',
            org: '4',
            env: '5'
          } );
        } ).then( done, done );
    }, 2000 );

  } );

  it( 'should update account settings', function () {

    return cli.dispatch( [ 'account', 'set', 'mocha', 'username', 'x' ] )
      .then( function () {
        return cli.dispatch( [ 'account', 'get', 'mocha' ] );
      } )
      .then( function ( account ) {
        assert.deepEqual( account, {
          url: '1',
          username: 'x',
          password: '3',
          org: '4',
          env: '5'
        } );
      } );

  } );

  it( 'should delete accounts', function () {

    return cli.dispatch( [ 'account', 'delete', 'mocha' ] )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'account', 'get', 'mocha' ] );
      } )
      .then( describe.fail )
      .catch( function ( err ) {
        assert.equal( err.message, 'Unknown account' );
      } );

  } );

  it( 'should report an unknown account', function () {

    return cli.dispatch( [ 'account', 'get', 'unk' ] )
      .then( describe.fail )
      .catch( function ( err ) {
        assert.equal( err.message, 'Unknown account' );
      } );

  } );

} );
