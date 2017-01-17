var fs = require( 'fs' );
var request = require( 'request' );
var apiError = require( './apiError' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:target' );

module.exports = {

  list: function ( account ) {

    var url = this.base( account );

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return JSON.parse( body ).map( function ( name ) {
          return name;
        } ).join( '\n' );
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  get: function ( account, targetServer ) {

    if ( !targetServer ) throw new Error( 'Missing targetServer' );

    var url = this.base( account ) + '/' + targetServer;

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return JSON.parse( body );
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  deploy: function ( account, source, targetServer ) {

    if ( !source ) throw new Error( 'Missing source file' );
    if ( !targetServer ) throw new Error( 'Missing targetServer' );

    var base = this.base( account );
    var contents;
    var contentType = source.match( /\.xml$/i ) ? 'text/xml' : 'application/json';
    debug( contentType );

    return nfcall( fs.readFile, source )
      .then( function ( c ) {

        contents = c.toString( 'utf-8' );

        return nfcall( request, {
          method: 'GET',
          url: base + '/' + targetServer,
          auth: account
        } );

      } )
      .then( function ( r ) {

        debug( r[ 1 ] );
        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 ) {

          return nfcall( request, {
            method: 'PUT',
            url: base + '/' + targetServer,
            body: contents,
            auth: account,
            headers: {
              'Content-Type': contentType
            }
          } );

        } else if ( response.statusCode === 404 ) {

          return nfcall( request, {
            method: 'POST',
            url: base + '?name=' + targetServer,
            body: contents,
            auth: account,
            headers: {
              'Content-Type': contentType
            }
          } );

        } else {

          throw apiError( 'Status ' + response.statusCode, body );

        }

      } )
      .then( function ( r ) {

        debug( r[ 1 ] );
        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 || response.statusCode === 201 ) {
          return { ok: true };
        } else {
          throw apiError( 'Status ' + response.statusCode, body );
        }

      } );

  },

  delete: function ( account, targetServer ) {

    if ( !targetServer ) throw new Error( 'Missing targetServer' );

    var url = this.base( account ) + '/' + targetServer;

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) return { ok: true };

      throw apiError( 'Status ' + response.statusCode, body );

    } );

  },

  base: function ( account ) {

    if ( !account.org ) throw new Error( 'Missing organization' );
    if ( !account.env ) throw new Error( 'Missing environment' );

    var base = account.url.replace( /\/+$/, '' );
    base += '/v1/o/' + account.org;
    base += '/e/' + account.env;
    base += '/targetservers';

    return base;

  }

};
