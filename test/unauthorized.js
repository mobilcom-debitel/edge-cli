var assert = require( 'assert' );
var cli = require( '../' );

require( './suite' );

describe( 'Any controller', function () {

  this.timeout( 20000 );

  it( 'should report 401 if using invalid credentials', function ( done ) {

    cli.dispatch( [ 'edge', 'account', 'get', describe.account ] )
      .then( function ( account ) {
        return cli.dispatch( [ 'edge', 'account', 'create',
          'mocha-invalid',
          account.url,
          account.user,
          'invalid',
          account.org,
          account.env
        ] );
      } )
      .then( describe.ok )
      .then( function () {
        return cli.dispatch( [ 'edge', 'mocha-invalid', 'resource', 'list' ] );
      } )
      .then( describe.not( done ), function ( err ) {
        assert.ok( err.message.match( /401/ ) );
        done();
      } );

  } );

} );
