var Q = require( 'q' );
var request = require( './request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:resource' );

module.exports = {

  get: function ( target, config ) {

    var url = this.base( target, config );
    var auth = this.auth( config );

    if ( target.resourceType ) url += '/' + target.resourceType;
    if ( target.resourceName ) url += '/' + target.resourceName;

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {

        if ( target.resourceType && target.resourceName ) {
          console.log( body );
        } else {
          JSON.parse( body ).resourceFile.forEach( function ( rf ) {
            console.log( ( rf.type || target.resourceType ) + '/' + rf.name );
          } );
        }

        return true;
      } else {
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  upload: function ( source, target, config ) {

    if ( !source ) {
      throw new Error( 'Missing source file' );
    }

    if ( !target.resourceType || !target.resourceName ) {
      throw new Error( 'Invalid resource, should be /r/<type>/<name>' );
    }

    var base = this.base( target, config );
    var auth = this.auth( config );

    return readFile( source )
      .then( function ( c ) {

        contents = c;

        return request( {
          method: 'GET',
          url: base + '/' + target.resourceType + '/' + target.resourceName,
          auth: auth
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 ) {

          return request( {
            method: 'PUT',
            url: base + '/' + target.resourceType + '/' + target.resourceName,
            body: contents,
            auth: auth
          } );

        } else if ( response.statusCode === 404 ) {

          return request( {
            method: 'POST',
            url: base + '?type=' + target.resourceType + '&name=' + target.resourceName,
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
          return true;
        } else {
          throw new Error( 'Unhandled status ' + response.statusCode );
        }

      } );

  },

  del: function ( target, config ) {

    if ( !target.resourceType || !target.resourceName ) {
      throw new Error( 'Invalid resource, should be /r/<type>/<name>' );
    }

    var url = this.base( target, config ) + '/' + target.resourceType + '/' + target.resourceName;
    var auth = this.auth( config );

    return request( {
      method: 'DELETE',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return true;
      } else {
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  base: function ( target, config ) {

    if ( !target.organization ) {
      throw new Error( 'Missing organization' );
    }

    var base = config.baseUrl;
    base += '/v1/organizations/' + target.organization;
    if ( target.environment ) base += '/environments/' + target.environment;
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
