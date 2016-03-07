var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var Lo = require( 'lodash' );
var debug = require( 'debug' )( 'edge-cli:config' );

module.exports = {

  set: function ( account, key, value ) {

    if ( !key ) throw new Error( 'Missing key' );

    var path = 'accounts.' + account.name + '.' + key;
    var self = this;

    return this.load()
      .then( function ( config ) {
        Lo.set( config, path, value );

        return writeFile( self.path(), JSON.stringify( config ) )
          .then( function () {
            return 'OK';
          } );
      } );

  },

  get: function ( account, key ) {

    if ( !key ) throw new Error( 'Missing key' );

    var path = 'accounts.' + account.name + '.' + key;

    return this.load()
      .then( function ( config ) {
        return Lo.get( config, path );
      } );

  },

  load: function () {
    return readFile( this.path() )
      .then( function ( config ) {
        return JSON.parse( config );
      } )
      .catch( function ( err ) {
        debug( err );
        return { accounts: {} };
      } );
  },

  path: function () {
    var home = process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
    var path = process.env.EDGE_CLI_CONF || ( home + '/.edge' );

    debug( home );
    debug( path );

    return path;
  }

};
