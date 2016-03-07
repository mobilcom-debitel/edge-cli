var Q = require( 'Q' );
var archiver = require( 'archiver' );
var request = require( './request' );
var req = require( 'request' );
var readFile = require( './readFile' );
var debug = require( 'debug' )( 'edge-cli:proxy' );

module.exports = {

  validate: function ( account, source, proxy ) {
    return this.upload( account, source, proxy, false );
  },

  deploy: function ( account, source, proxy ) {
    return this.upload( account, source, proxy, true );
  },

  upload: function ( account, source, proxy, deploy ) {

    var self = this;
    var action = deploy ? 'import' : 'validate';

    return Q.Promise( function ( resolve, reject ) {

      if ( !source ) throw new Error( 'Missing source path' );
      if ( !proxy ) throw new Error( 'Missing proxy' );

      var base = self.base( account );
      var auth = self.auth( account );

      debug( source );
      debug( proxy );

      var archive = archiver( 'zip', {} );
      //archive.on( 'entry', debug );
      archive.on( 'error', debug );

      var post = req( {
        method: 'POST',
        url: base + '?action=' + action + '&name=' + proxy,
        auth: auth,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      } );

      post.on( 'response', resolve ).on( 'error', reject );

      archive.directory( source, 'apiproxy' ).finalize().pipe( post );

    } ).then( function ( response ) {

      debug( response.statusCode );

      var body = [];

      response.on( 'data', function ( chunk ) {
        body.push( chunk );
      } );

      return Q.Promise( function ( resolve, reject ) {
        response.on( 'end', function () {
          resolve( [ response, Buffer.concat( body ) ] );
        } ).on( 'error', reject );
      } );

    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( deploy ) {
        var data = JSON.parse( body.toString( 'utf-8' ) );
        return self.deployRevision( account, proxy, data.revision );
      } else {
        return body.toString( 'utf-8' );
      }

    } );

  },

  deployRevision: function ( account, proxy, revision ) {

    var self = this;

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !proxy ) throw new Error( 'Missing revision' );

    var url = self.base( account, true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments';
    var auth = self.auth( account );

    debug( proxy );
    debug( revision );

    return self.undeploy( account, proxy )
      .then( function () {

        return request( {
          method: 'POST',
          url: url,
          auth: auth
        } );

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

  undeploy: function ( account, proxy ) {

    var self = this;

    return this.deployments( account, proxy )
      .then( function ( revisions ) {
        return self.undeployRevisions( account, proxy, revisions );
      } );

  },

  undeployRevisions: function ( account, proxy, revisions ) {

    if ( revisions.length === 0 ) return Q( 'OK' );

    var self = this;
    var revision = revisions.pop();

    var url = self.base( account, true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments';
    var auth = self.auth( account );

    return request( {
      method: 'DELETE',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return self.undeploy( account, proxy, revisions );
      } else {
        debug( body );
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  deployments: function ( account, proxy ) {

    var self = this;

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var url = self.base( account ) +
      '/' + proxy +
      '/deployments';
    var auth = self.auth( account );

    return request( {
      method: 'GET',
      url: url,
      auth: auth
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        var data = JSON.parse( body.toString( 'utf-8' ) );
        var env = data.environment.filter( function ( e ) {
          return e.name === account.env;
        } )[ 0 ];

        debug( env );

        if ( !env ) return [];

        return env.revision.map( function ( rev ) {
          return rev.name;
        } );

      } else {
        debug( body );
        throw new Error( 'Unhandled status ' + response.statusCode );
      }

    } );

  },

  base: function ( account, withEnv ) {

    if ( !account.org ) throw new Error( 'Missing organization' );
    if ( !account.env ) throw new Error( 'Missing environment' );

    var base = account.url.replace( /\/+$/, '' );
    base += '/v1/o/' + account.org;
    if ( withEnv ) base += '/e/' + account.env;
    base += '/apis';

    return base;

  },

  auth: function ( account ) {
    return {
      user: account.user,
      password: account.password
    };
  }

};
