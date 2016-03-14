var Q = require( 'q' );
var req = require( 'request' );
var archiver = require( 'archiver' );

var request = require( './request' );
var readFile = require( './readFile' );
var apiError = require( './apiError' );
var debug = require( 'debug' )( 'edge-cli:proxy' );

module.exports = {

  update: function ( account, source, proxy ) {
    var self = this;
    return this.deployments( account, proxy )
      .then( function ( revisions ) {

        if ( !source ) throw new Error( 'Missing source path' );
        if ( !proxy ) throw new Error( 'Missing proxy' );

        debug( revisions );

        return self.updateRevision( account, source, proxy, revisions[ 0 ] );

      } );
  },

  updateRevision: function ( account, source, proxy, revision ) {

    var self = this;

    return Q.Promise( function ( resolve, reject ) {

      if ( !source ) throw new Error( 'Missing source path' );
      if ( !proxy ) throw new Error( 'Missing proxy' );
      if ( !revision ) throw new Error( 'Missing revision' );

      var base = self.base( account );

      var archive = archiver( 'zip' );
      archive.on( 'error', function ( err ) {
        debug( err );
        reject( new Error( 'Invalid proxy directory' ) );
      } );

      var url = base + '/' + proxy + '/revisions/' + revision;
      debug( url );

      var post = req( {
        method: 'POST',
        url: url,
        auth: account,
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

      if ( response.statusCode === 200 ) {
        body = JSON.parse( body );
        body.ok = true;
        return body;
      }

      throw apiError( 'Error ' + response.statusCode, body );

    } );

  },

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

      debug( source );
      debug( proxy );

      var archive = archiver( 'zip', {} );
      archive.on( 'error', function ( err ) {
        debug( err );
        reject( new Error( 'Invalid proxy directory' ) );
      } );

      var post = req( {
        method: 'POST',
        url: base + '?action=' + action + '&name=' + proxy,
        auth: account,
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

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        if ( deploy ) {
          return self.deployRevision( account, proxy, JSON.parse( body ).revision );
        } else {
          return JSON.parse( body );
        }

      }

      throw apiError( 'Status ' + response.statusCode, body );

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

    debug( proxy );
    debug( revision );

    return self.undeploy( account, proxy )
      .then( function () {

        return request( {
          method: 'POST',
          url: url,
          auth: account
        } );

      } )
      .then( function ( r ) {

        var response = r[ 0 ], body = r[ 1 ];

        if ( response.statusCode === 200 || response.statusCode === 201 ) {
          return { ok: true };
        } else {
          throw apiError( 'Error ' + response.statusCode, body );
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

    if ( revisions.length === 0 ) return Q( { ok: true } );

    var self = this;
    var revision = revisions.pop();

    var url = self.base( account, true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments';

    return request( {
      method: 'DELETE',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 ) {
        return self.undeploy( account, proxy, revisions );
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } );

  },

  deployments: function ( account, proxy ) {

    var self = this;

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var url = self.base( account ) +
      '/' + proxy +
      '/deployments';

    return request( {
      method: 'GET',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        var env = JSON.parse( body ).environment.filter( function ( e ) {
          return e.name === account.env;
        } )[ 0 ];

        debug( env );

        if ( !env ) return [];

        return env.revision.map( function ( rev ) {
          return rev.name;
        } );

      } else {
        throw apiError( 'Error ' + response.statusCode, data );
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

  }

};
