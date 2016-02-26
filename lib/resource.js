var Q = require( 'q' );
var request = require( './request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:resource' );

module.exports = {

  get: function ( remote, config ) {

    var url = this.base( remote, config );
    var auth = this.auth( config );

    if ( remote.resourceType ) url += '/' + remote.resourceType;
    if ( remote.resourceName ) url += '/' + remote.resourceName;

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var output = '';
      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {

        if ( remote.resourceType && remote.resourceName ) {
          output += body + '\n';
        } else {
          JSON.parse( body ).resourceFile.forEach( function ( rf ) {
            output += ( rf.type || remote.resourceType ) + '/' + rf.name;
          } );
        }

        return output;
      } else {
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  upload: function ( source, remote, config ) {

    if ( !source ) {
      throw new Error( 'Missing source file' );
    }

    if ( !remote.resourceType || !remote.resourceName ) {
      throw new Error( 'Invalid resource, should be /r/<type>/<name>' );
    }

    var base = this.base( remote, config );
    var auth = this.auth( config );

    return readFile( source )
      .then( function ( c ) {

        contents = c;

        return request( {
          method: 'GET',
          url: base + '/' + remote.resourceType + '/' + remote.resourceName,
          auth: auth
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 ) {

          return request( {
            method: 'PUT',
            url: base + '/' + remote.resourceType + '/' + remote.resourceName,
            body: contents,
            auth: auth
          } );

        } else if ( response.statusCode === 404 ) {

          return request( {
            method: 'POST',
            url: base + '?type=' + remote.resourceType + '&name=' + remote.resourceName,
            body: contents,
            auth: auth
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

  del: function ( remote, config ) {

    if ( !remote.resourceType || !remote.resourceName ) {
      throw new Error( 'Invalid resource, should be /r/<type>/<name>' );
    }

    var url = this.base( remote, config ) + '/' + remote.resourceType + '/' + remote.resourceName;
    var auth = this.auth( config );

    return request( {
      method: 'DELETE',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return 'OK';
      } else {
        debug( body );
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  base: function ( remote, config ) {

    if ( !remote.organization ) {
      throw new Error( 'Missing organization' );
    }

    var base = config.url.replace( /\/+$/, '' );
    base += '/v1/organizations/' + remote.organization;
    if ( remote.environment ) base += '/environments/' + remote.environment;
    base += '/resourcefiles';

    return base;

  },

  auth: function ( config ) {
    return {
      user: config.user,
      password: config.password
    };
  }

};
