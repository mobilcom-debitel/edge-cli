var Q = require( 'q' );
var request = require( './request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:target' );

module.exports = {

  get: function ( remote, config ) {

    var url = this.base( remote, config );
    var auth = this.auth( config );

    if ( remote.targetName ) url += '/' + remote.targetName;

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var output = '';
      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {

        if ( remote.targetName ) {
          output += body + '\n';
        } else {
          JSON.parse( body ).forEach( function ( name ) {
            output += name + '\n';
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

    if ( !remote.targetName ) {
      throw new Error( 'Invalid target, should be /t/<name>' );
    }

    var base = this.base( remote, config );
    var auth = this.auth( config );

    return readFile( source )
      .then( function ( c ) {

        contents = c;

        return request( {
          method: 'GET',
          url: base + '/' + remote.targetName,
          auth: auth
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 ) {

          return request( {
            method: 'PUT',
            url: base + '/' + remote.targetName,
            body: contents,
            auth: auth,
            headers: {
              'Content-Type': 'text/xml'
            }
          } );

        } else if ( response.statusCode === 404 ) {

          return request( {
            method: 'POST',
            url: base + '?name=' + remote.targetName,
            body: contents,
            auth: auth,
            headers: {
              'Content-Type': 'text/xml'
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

  del: function ( remote, config ) {

    if ( !remote.targetName ) {
      throw new Error( 'Invalid target, should be /t/<name>' );
    }

    var url = this.base( remote, config ) + '/' + remote.targetName;
    var auth = this.auth( config );

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

  base: function ( remote, config ) {

    if ( !remote.organization ) {
      throw new Error( 'Missing organization' );
    }

    if ( !remote.environment ) {
      throw new Error( 'Missing environment' );
    }

    var base = config.url.replace( /\/+$/, '' );
    base += '/v1/organizations/' + remote.organization;
    base += '/environments/' + remote.environment;
    base += '/targetservers';

    return base;

  },

  auth: function ( config ) {
    return {
      user: config.user,
      password: config.password
    };
  }

};
