var fs = require( 'fs' );
var request = require( 'request' );

var proxyZip = require( './proxyZip' );
var proxyChecksum = require( './proxyChecksum' );
var apiError = require( './apiError' );
var spread = require( './spread' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:proxy' );

module.exports = {

  // unstable
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

    return Promise.all( [
      this.remoteChecksum( account, proxy, revision ),
      proxyChecksum( source )
    ] ).then( spread( function ( remote, local ) {

      debug( remote );
      debug( local );

      if ( remote === local ) return { ok: true, skipped: 'checksum' };

      return self.updateRevisionUnchecked( account, source, proxy, revision );

    } ) );

  },

  updateRevisionUnchecked: function ( account, source, proxy, revision ) {

    var self = this;

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    return proxyZip( source ).then( function ( zip ) {

      var base = self.base( account );
      var url = base + '/' + proxy + '/revisions/' + revision;

      return nfcall( request, {
        method: 'POST',
        url: url,
        auth: account,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: zip
      } );

    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        var json = body = JSON.parse( body );
        json.ok = true;
        return json;
      }

      throw apiError( 'Error ' + response.statusCode, body );

    } ) );

  },

  validate: function ( account, source ) {
    return this.upload( account, source, '__validate', false );
  },

  deploy: function ( account, source, proxy ) {

    var self = this;

    return proxyChecksum( source ).then( function ( checksum ) {
      return self.deployChecksum( account, proxy, checksum );
    } ).catch( function ( err ) {

      if ( err.message.match( /Checksum not found|Error 404/ ) ) {
        return self.forceDeploy( account, source, proxy );
      }

      throw err;

    } );

  },

  deployChecksum: function ( account, proxy, checksum ) {

    var self = this;
    var revisions;

    return this.revisions( account, proxy ).then( function ( data ) {

      revisions = data.revisions;

      return Promise.all( revisions.map( function ( rev ) {
        return self.remoteChecksum( account, proxy, rev );
      } ) );

    } ).then( function ( checksums ) {

      debug( checksums );

      var index = checksums.indexOf( checksum );
      if ( index >= 0 ) return self.deployRevision( account, proxy, revisions[ index ] );

      throw new Error( 'Checksum not found' );

    } ).then ( function ( result ) {

      result.skipped = 'checksum';
      return result;

    } );

  },

  forceDeploy: function ( account, source, proxy ) {
    return this.upload( account, source, proxy, true );
  },

  upload: function ( account, source, proxy, deploy ) {

    var self = this;
    var action = deploy ? 'import' : 'validate';

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );

    return proxyZip( source ).then( function ( zip ) {

      var base = self.base( account );

      debug( source );
      debug( proxy );

      return nfcall( request, {
        method: 'POST',
        url: base + '?action=' + action + '&name=' + proxy,
        auth: account,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: zip
      } );

    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        if ( deploy ) {
          return self.deployRevision( account, proxy, JSON.parse( body ).revision );
        } else {
          return JSON.parse( body );
        }

      }

      throw apiError( 'Status ' + response.statusCode, body );

    } ) );

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
      '/deployments';

    return nfcall( request, {
      method: 'POST',
      url: url,
      form: {
        override: true,
        delay: 60
      },
      auth: account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 ) {
        return { ok: true };
      } if ( response.statusCode === 400 && body.match( /distribution\.APIProxyRevisionAlreadyDeployed/ ) ) {
        return { ok: true, info: 'Already deployed' };
      } else {
        throw apiError( 'Status ' + response.statusCode, body );
      }

    } ) );

  },

  // "file" argument is unstable
  undeploy: function ( account, proxy, file ) {

    var self = this;
    var data;

    return this.deployments( account, proxy ).then( function ( revisions ) {
      return self.undeployRevisions( account, proxy, revisions );
    } ).then( function ( data_ ) {
      data = data_;
      if ( file ) return nfcall( fs.writeFile, file, JSON.stringify( data ) );
    } ).then( function () {
      return data;
    } );

  },

  undeployRevisions: function ( account, proxy, revisions, undeployed ) {

    undeployed = undeployed || [];

    if ( revisions.length === 0 ) return Promise.resolve( { revisions: undeployed } );

    var self = this;
    var revision = revisions.pop();

    var url = self.base( account, true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments';

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        undeployed.push( revision );
        return self.undeployRevisions( account, proxy, revisions, undeployed );
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

  },

  deployments: function ( account, proxy ) {

    var self = this;

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var url = self.base( account ) +
      '/' + proxy +
      '/deployments';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: account
    } ).then( spread( function ( response, body ) {

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

    } ) );

  },

  redeploy: function ( account, proxy, file ) {

    if ( !file ) throw new Error( 'Missing redeployment file' );

    var self = this;

    return nfcall( fs.readFile, file ).then ( function ( body ) {
      return self.redeployRevisions( account, proxy, JSON.parse( body ).revisions );
    } );

  },

  redeployRevisions: function ( account, proxy, revisions, all ) {

    all = all || revisions.slice( 0 );

    if ( !revisions ) throw new Error( 'Missing redeployment revisions' );
    if ( revisions.length === 0 ) return Promise.resolve( { revisions: all } );

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

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 404 ) {
        return { ok: true };
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

  },

  bundle: function ( account, source, dest ) {
    return proxyZip( source ).then( function ( zip ) {
      return new Promise( function ( resolve, reject ) {
        zip.pipe( fs.createWriteStream( dest ) )
          .on( 'finish', function () { resolve( { ok: true } ); } )
          .on( 'error', reject );
      } );
    } );
  },

  download: function ( account, proxy, revision, out ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );
    if ( !out ) throw new Error( 'Missing output file' );

    var self = this;
    var url = self.base( account ) + '/' + proxy + '/revisions/' + revision + '?format=bundle';

    return new Promise( function ( resolve, reject ) {

      var req = request( {
        method: 'GET',
        url: url,
        auth: account
      } );

      req.on( 'response', function ( response ) {
          if ( response.statusCode !== 200 ) {
            throw apiError( 'Error ' + response.statusCode, body );
          }
      } )
        .on( 'error', reject )
        .pipe( fs.createWriteStream( out ) )
        .on( 'finish', function () { resolve( { ok: true } ); } )
        .on( 'error', reject );

    } );

  },

  checksum: function ( account, source ) {

    if ( !source ) throw new Error( 'Missing source' );

    return proxyChecksum( source );

  },

  remoteChecksum: function ( account, proxy, revision ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    var self = this;
    var url = self.base( account ) + '/' + proxy + '/revisions/' + revision +
      '/resourcefiles/jsc/checksum.js';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        return body;
      }

      return 'unknown';

    } ) );

  },

  revisions: function ( account, proxy ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var self = this;
    var url = self.base( account ) + '/' + proxy + '/revisions';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        return { revisions: JSON.parse( body ) };
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

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
