var fs = require( 'fs' );
var request = require( 'request' );
var apiError = require( './apiError' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:resource' );

module.exports = ResourceController;

function ResourceController( account ) {
  this.account = account;
}

Object.assign( ResourceController.prototype, {

  list: function () {

    var url = this.base();

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: this.account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {

        return JSON.parse( body ).resourceFile.map( function ( rf ) {
          return rf.type + '/' + rf.name;
        } ).join( '\n' );

      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  get: function ( resource ) {

    this.validateResource( resource );

    var url = this.base();

    url += '/' + resource;

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: this.account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return body;
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  deploy: function ( source, resource ) {

    this.validateSource( source );
    this.validateResource( resource );

    var self = this;
    var base = this.base();
    var contents;

    return nfcall( fs.readFile, source )
      .then( function ( c ) {

        contents = c.toString( 'utf-8' );

        return nfcall( request, {
          method: 'GET',
          url: base + '/' + resource,
          auth: self.account
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 ) {

          return nfcall( request, {
            method: 'PUT',
            url: base + '/' + resource,
            body: contents,
            auth: self.account
          } );

        } else if ( response.statusCode === 404 ) {

          var parts = resource.split( /\//g );
          var type = parts[ 0 ];
          var name = parts[ 1 ];

          return nfcall( request, {
            method: 'POST',
            url: base + '?type=' + type + '&name=' + name,
            body: contents,
            auth: self.account
          } );

        } else {

          throw apiError( 'Status ' + response.statusCode, body );

        }

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 || response.statusCode === 201 ) {
          return { ok: true };
        } else {
          throw apiError( 'Status ' + response.statusCode, body );
        }

      } );

  },

  delete: function ( resource ) {

    this.validateResource( resource );

    var url = this.base() + '/' + resource;

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: this.account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return { ok: true };
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  validateSource: function ( source ) {
    if ( !source ) {
      throw new Error( 'Missing source file' );
    }
  },

  validateResource: function ( resource ) {
    if ( !resource || resource.split( /\//g ).length !== 2 ) {
      throw new Error( 'Missing or invalid resource, expected <type>/<name>' );
    }
  },

  base: function () {

    var account = this.account;
    if ( !account ) throw new Error( 'Missing account' );
    if ( !account.org ) throw new Error( 'Missing organization' );
    if ( !account.env ) throw new Error( 'Missing environment' );

    var base = account.url.replace( /\/+$/, '' );
    base += '/v1/o/' + account.org;
    base += '/e/' + account.env;
    base += '/resourcefiles';

    return base;

  }

} );
