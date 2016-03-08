var request = require( './request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:resource' );

module.exports = {

  list: function ( account ) {

    var url = this.base( account );
    var auth = this.auth( account );

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];
      var data = JSON.parse( body );

      if ( response.statusCode === 200 ) {

        return data.resourceFile.map( function ( rf ) {
          return rf.type + '/' + rf.name;
        } ).join( '\n' );

      } else {
        throw apiError( 'Error ' + response.statusCode, data );
      }

    } );

  },

  get: function ( account, resource ) {

    this.validateResource( resource );

    var url = this.base( account );
    var auth = this.auth( account );

    url += '/' + resource;

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];
      var data = JSON.parse( body );

      if ( response.statusCode === 200 ) {
        return data;
      } else {
        throw apiError( 'Error ' + response.statusCode, data );
      }

    } );

  },

  deploy: function ( account, source, resource ) {

    this.validateSource( source );
    this.validateResource( resource );

    var base = this.base( account );
    var auth = this.auth( account );
    var contents;

    return readFile( source )
      .then( function ( c ) {

        contents = c.toString( 'utf-8' );

        return request( {
          method: 'GET',
          url: base + '/' + resource,
          auth: auth
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];
        var data = JSON.parse( body );

        if ( response.statusCode === 200 ) {

          return request( {
            method: 'PUT',
            url: base + '/' + resource,
            body: contents,
            auth: auth
          } );

        } else if ( response.statusCode === 404 ) {

          var parts = resource.split( /\//g );
          var type = parts[ 0 ];
          var name = parts[ 1 ];

          return request( {
            method: 'POST',
            url: base + '?type=' + type + '&name=' + name,
            body: contents,
            auth: auth
          } );

        } else {

          throw apiError( 'Error ' + response.statusCode, data );

        }

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];
        var data = JSON.parse( body );

        if ( response.statusCode === 200 || response.statusCode === 201 ) {
          return { ok: true };
        } else {
          throw apiError( 'Error ' + response.statusCode, data );
        }

      } );

  },

  'delete': function ( account, resource ) {

    this.validateResource( resource );

    var url = this.base( account ) + '/' + resource;
    var auth = this.auth( account );

    return request( {
      method: 'DELETE',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];
      var data = JSON.parse( body );

      if ( response.statusCode === 200 ) {
        return { ok: true };
      } else {
        throw apiError( 'Error ' + response.statusCode, data );
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

  base: function ( account ) {

    if ( !account.org ) throw new Error( 'Missing organization' );
    if ( !account.env ) throw new Error( 'Missing environment' );

    var base = account.url.replace( /\/+$/, '' );
    base += '/v1/o/' + account.org;
    base += '/e/' + account.env;
    base += '/resourcefiles';

    return base;

  },

  auth: function ( account ) {
    return {
      user: account.user,
      password: account.password
    };
  }

};
