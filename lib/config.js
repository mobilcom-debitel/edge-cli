var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var Lo = require( 'lodash' );
var debug = require( 'debug' )( 'edge-cli:config' );

module.exports = {

  set: function ( key, value ) {

    if ( !key ) throw new Error( 'Config: Missing key' );
    if ( !value ) throw new Error( 'Config: Missing value' );

    var self = this;

    return this.load()
      .then( function ( config ) {
        Lo.set( config, key, value );
        return self.save( config );
      } );

  },

  get: function ( key ) {

    if ( !key ) throw new Error( 'Config: Missing key' );

    return this.load()
      .then( function ( config ) {
        return Lo.get( config, key );
      } );

  },

  delete: function ( key ) {

    if ( !key ) throw new Error( 'Config: Missing key' );

    var self = this;

    return this.load()
      .then( function ( config ) {
        Lo.unset( config, key );
        return self.save( config );
      } );

  },

  load: function () {
    return readFile( this.path() )
      .then( function ( config ) {
        return JSON.parse( config );
      } )
      .catch( function ( err ) {
        debug( err );
        return {};
      } );
  },

  save: function ( config ) {
    return writeFile( this.path(), JSON.stringify( config ) )
      .then( function () {
        return { ok: true };
      } );
  },

  path: function () {
    var home = process.env[ ( process.platform === 'win32' ) ? 'USERPROFILE' : 'HOME' ];
    var path = process.env.EDGE_CLI_CONF || ( home + '/.edge' );

    return path;
  }

};
