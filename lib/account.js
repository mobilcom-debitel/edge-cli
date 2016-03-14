var config = require( './config' );
var debug = require( 'debug' )( 'edge-cli:account' );

module.exports = {

  list: function () {
    return config.get( 'accounts' );
  },

  create: function ( name, url, user, password, org, env ) {
    if ( !name ) throw new Error( 'Missing account name' );
    if ( !url || !user || !password || !org || !env ) {
      throw new Error( 'Missing one of url, user, password, org, env' );
    }

    return config.set( 'accounts.' + name, {
      url: url,
      user: user,
      password: password,
      org: org,
      env: env
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
    return config.get( 'accounts.' + name );
  },

  delete: function ( name ) {
    if ( !name ) throw new Error( 'Missing account name' );
    return config.delete( 'accounts.' + name );
  }

};
