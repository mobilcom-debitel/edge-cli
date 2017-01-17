var config = require( './config' );
var ask = require( './ask' );
var debug = require( 'debug' )( 'edge-cli:account' );

module.exports = {

  list: function () {
    return config.get( 'accounts' );
  },

  setup: function ( name, url, username, password, org, env ) {

    if ( !name ) throw new Error( 'Missing account name' );

    var data = {
      url: url || ask( 'Apigee Management API URL: ' ),
      username: username || ask( 'Apigee Username: ' ),
      password: password || ask( 'Apigee Password: ', { hidden: true } ),
      org: org || ask( 'Organization: ' ),
      env: env || ask( 'Environment: ' )
    };

    var resolved = {};

    return Promise.all( Object.keys( data ).map( function ( key ) {
      return Promise.resolve( data[ key ] ).then( function ( value ) {
        resolved[ key ] = value;
      } );
    } ) ).then( function () {
      return config.set( 'accounts.' + name, resolved );
    } );

  },

  set: function ( name, key, value ) {
    if ( !name ) throw new Error( 'Missing account name' );
    if ( !key ) throw new Error( 'Missing key' );
    if ( !value ) throw new Error( 'Missing value' );

    return config.set( 'accounts.' + name + '.' + key, value );
  },

  get: function ( name ) {
    if ( !name ) throw new Error( 'Missing account name' );

    return config.get( 'accounts.' + name ).then( function ( account ) {

      if ( !account ) throw new Error( 'Unknown account' );

      // Support old format
      account.username = account.username || account.user;
      delete account.user;

      return account;

    } );

  },

  delete: function ( name ) {
    if ( !name ) throw new Error( 'Missing account name' );
    return config.delete( 'accounts.' + name );
  }

};
