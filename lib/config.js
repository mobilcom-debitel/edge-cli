var os = require( 'os' );
var fs = require( 'fs' );
var _ = require( 'lodash' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:config' );

module.exports = {

  set: function ( key, value ) {

    if ( !key ) throw new Error( 'Config: Missing key' );
    if ( !value ) throw new Error( 'Config: Missing value' );

    var self = this;

    return this.load()
      .then( function ( config ) {
        _.set( config, key, value );
        return self.save( config );
      } );

  },

  get: function ( key ) {

    if ( !key ) throw new Error( 'Config: Missing key' );

    return this.load()
      .then( function ( config ) {
        return _.get( config, key );
      } );

  },

  delete: function ( key ) {

    if ( !key ) throw new Error( 'Config: Missing key' );

    var self = this;

    return this.load()
      .then( function ( config ) {
        _.unset( config, key );
        return self.save( config );
      } );

  },

  load: function () {
    return nfcall( fs.readFile, this.path() )
      .then( function ( config ) {
        return JSON.parse( config );
      } )
      .catch( function ( err ) {
        debug( err );
        return {};
      } );
  },

  save: function ( config ) {
    return nfcall( fs.writeFile, this.path(), JSON.stringify( config ) )
      .then( function () {
        return { ok: true };
      } );
  },

  path: function () {
    return process.env.EDGE_CLI_CONF || ( os.homedir() + '/.edge' );
  }

};
