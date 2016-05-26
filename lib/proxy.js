var Q = require( 'q' );
var req = require( 'request' );

var request = require( './request' );
var streamedRequest = require( './streamedRequest' );
var zipDirectory = require( './zipDirectory' );
var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var apiError = require( './apiError' );
var debug = require( 'debug' )( 'edge-cli:proxy' );

module.exports = {

  update: function ( account, source, proxy ) {

    var self = this;

    return this.deployments( account, proxy ).then( function ( revisions ) {

      if ( !source ) throw new Error( 'Missing source path' );
      if ( !proxy ) throw new Error( 'Missing proxy' );

      debug( revisions );

      return self.updateRevision( account, source, proxy, revisions[ 0 ] );

    }, function ( err ) {
      if ( err.payload && err.payload.code === 'messaging.config.beans.ApplicationDoesNotExist' ) {
        return self.deploy( account, source, proxy );
      }
      throw err;
    } );

  },

  updateRevision: function ( account, source, proxy, revision ) {

    var self = this;

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    return zipDirectory( source, 'apiproxy' ).then( function ( zip ) {

      var base = self.base( account );
      var url = base + '/' + proxy + '/revisions/' + revision;

      return streamedRequest( {
        method: 'POST',
        url: url,
        auth: account,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }, zip );

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

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );

    return zipDirectory( source, 'apiproxy' ).then( function ( zip ) {

      var base = self.base( account );

      debug( source );
      debug( proxy );

      return streamedRequest( {
        method: 'POST',
        url: base + '?action=' + action + '&name=' + proxy,
        auth: account,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }, zip );

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

    debug( proxy );
    debug( revision );

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    var url = self.base( account, true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments?override=true&delay=10';

    // TODO make override and delay configurable

    return self.undeploy( account, proxy ).then( function () {

      return request( {
        method: 'POST',
        url: url,
        auth: account
      } );

    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 || response.statusCode === 201 ) {
        return { ok: true };
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  undeploy: function ( account, proxy, file ) {

    var self = this;
    var data;

    return this.deployments( account, proxy ).then( function ( revisions ) {
      return self.undeployRevisions( account, proxy, revisions );
    } ).then( function ( data_ ) {
      data = data_;
      if ( file ) return writeFile( file, JSON.stringify( data ) );
    } ).then( function () {
      return data;
    } );

  },

  undeployRevisions: function ( account, proxy, revisions, undeployed ) {

    undeployed = undeployed || [];

    if ( revisions.length === 0 ) return Q( { revisions: undeployed } );

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
        undeployed.push( revision );
        return self.undeployRevisions( account, proxy, revisions, undeployed );
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
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } );

  },

  redeploy: function ( account, proxy, file ) {

    if ( !file ) throw new Error( 'Missing redeployment file' );

    var self = this;

    return readFile( file ).then ( function ( body ) {
      return self.redeployRevisions( account, proxy, JSON.parse( body ).revisions );
    } );

  },

  redeployRevisions: function ( account, proxy, revisions, all ) {

    all = all || revisions.slice( 0 );

    if ( !revisions ) throw new Error( 'Missing redeployment revisions' );
    if ( revisions.length === 0 ) return Q( { revisions: all } );

    var self = this;

    return this.deployRevision( account, proxy, revisions.pop() )
      .then( function () {
        return self.redeployRevisions( account, proxy, revisions, all );
      } );

  },

  remove: function ( account, proxy ) {

    var self = this;

    return this.undeploy( account, proxy ).then( del, del );

    function del() {
      return self.delete( account, proxy );
    }

  },

  delete: function ( account, proxy ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var self = this;
    var url = self.base( account ) + '/' + proxy;

    return request( {
      method: 'DELETE',
      url: url,
      auth: account
    } ).then( function ( r ) {

      var response = r[ 0 ], body = r[ 1 ];

      if ( response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 404 ) {
        return { ok: true };
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
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
