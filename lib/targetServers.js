var Q = require( 'q' );
var request = require( './request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:target' );

module.exports = {

  list: function ( account ) {

    var url = this.base( account );
    var auth = this.auth( account );

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var output = '';
      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return JSON.parse( body ).map( function ( name ) {
          return name;
        } ).join( '\n' );
      } else {
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  get: function ( account, targetServer ) {

    if ( !targetServer ) throw new Error( 'Missing targetServer' );

    var url = this.base( account ) + '/' + targetServer;
    var auth = this.auth( account );

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var output = '';
      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return body;
      } else {
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  deploy: function ( account, source, targetServer ) {

    if ( !source ) throw new Error( 'Missing source file' );
    if ( !targetServer ) throw new Error( 'Missing targetServer' );

    var base = this.base( account );
    var auth = this.auth( account );
    var contents;
    var contentType = source.match( /\.xml$/i ) ? 'text/xml' : 'application/json';

    return readFile( source )
      .then( function ( c ) {

        contents = c.toString( 'utf-8' );

        return request( {
          method: 'GET',
          url: base + '/' + targetServer,
          auth: auth
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        debug( contentType );

        if ( response.statusCode === 200 ) {

          return request( {
            method: 'PUT',
            url: base + '/' + targetServer,
            body: contents,
            auth: auth,
            headers: {
              'Content-Type': contentType
            }
          } );

        } else if ( response.statusCode === 404 ) {

          return request( {
            method: 'POST',
            url: base + '?name=' + targetServer,
            body: contents,
            auth: auth,
            headers: {
              'Content-Type': contentType
            }
          } );

        } else {

          debug( body );
          throw new Error( 'Unhandled status ' + response.statusCode );

        }

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 || response.statusCode === 201 ) {
          return 'OK';
        } else {
          debug( body );
          throw new Error( 'Unhandled status ' + response.statusCode );
        }

      } );

  },

  'delete': function ( account, targetServer ) {

    if ( !targetServer ) {
      throw new Error( 'Invalid target, should be /t/<name>' );
    }

    var url = this.base( account ) + '/' + targetServer;
    var auth = this.auth( account );

    return request( {
      method: 'DELETE',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) return 'OK';

      debug( body );
      throw new Error( 'Unhandled status ' + response.statusCode );

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

  },

  auth: function ( account ) {
    return {
      user: account.user,
      password: account.password
    };
  }

};
