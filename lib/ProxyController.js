var fs = require( 'fs' );
var request = require( 'request' );

var proxyZip = require( './proxyZip' );
var proxyChecksum = require( './proxyChecksum' );
var apiError = require( './apiError' );
var spread = require( './spread' );
var nfcall = require( './nfcall' );
var debug = require( 'debug' )( 'edge-cli:proxy' );

module.exports = ProxyController;

function ProxyController( account ) {
  this.account = account;
}

Object.assign( ProxyController.prototype, {

  // unstable
  update: function ( source, proxy ) {

    var self = this;

    return this.deployments( proxy ).then( function ( revisions ) {

      if ( !source ) throw new Error( 'Missing source path' );
      if ( !proxy ) throw new Error( 'Missing proxy' );

      debug( revisions );

      return self.updateRevision( source, proxy, revisions[ 0 ] );

    }, function ( err ) {
      if ( err.payload && err.payload.code === 'messaging.config.beans.ApplicationDoesNotExist' ) {
        return self.deploy( source, proxy );
      }
      throw err;
    } );

  },

  updateRevision: function ( source, proxy, revision ) {

    var self = this;

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    return Promise.all( [
      this.remoteChecksum( proxy, revision ),
      proxyChecksum( source )
    ] ).then( spread( function ( remote, local ) {

      debug( remote );
      debug( local );

      if ( remote === local ) return { ok: true, skipped: 'checksum' };

      return self.updateRevisionUnchecked( source, proxy, revision );

    } ) );

  },

  updateRevisionUnchecked: function ( source, proxy, revision ) {

    var self = this;

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    return proxyZip( source ).then( function ( zip ) {

      var base = self.base();
      var url = base + '/' + proxy + '/revisions/' + revision;

      return nfcall( request, {
        method: 'POST',
        url: url,
        auth: self.account,
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

  validate: function ( source ) {
    var self = this;
    return this.upload( source, '__validate', false )
      .then( function ( result ) {
        return self.delete( '__validate' ).then( function () {
          return result;
        } );
      } );
  },

  deploy: function ( source, proxy ) {

    var self = this;

    return proxyChecksum( source ).then( function ( checksum ) {
      return self.deployChecksum( proxy, checksum );
    } ).catch( function ( err ) {

      if ( err.message.match( /Checksum not found|Error 404/ ) ) {
        return self.forceDeploy( source, proxy );
      }

      throw err;

    } );

  },

  deployChecksum: function ( proxy, checksum ) {

    var self = this;
    var revisions;

    return this.revisions( proxy ).then( function ( data ) {

      revisions = data.revisions;

      return Promise.all( revisions.map( function ( rev ) {
        return self.remoteChecksum( proxy, rev );
      } ) );

    } ).then( function ( checksums ) {

      debug( checksums );

      var index = checksums.indexOf( checksum );
      if ( index >= 0 ) return self.deployRevision( proxy, revisions[ index ] );

      throw new Error( 'Checksum not found' );

    } ).then ( function ( result ) {

      result.skipped = 'checksum';
      return result;

    } );

  },

  forceDeploy: function ( source, proxy ) {
    return this.upload( source, proxy, true );
  },

  upload: function ( source, proxy, deploy ) {

    var self = this;
    var action = deploy ? 'import' : 'validate';

    if ( !source ) throw new Error( 'Missing source path' );
    if ( !proxy ) throw new Error( 'Missing proxy' );

    return proxyZip( source ).then( function ( zip ) {

      var base = self.base();

      debug( source );
      debug( proxy );

      return nfcall( request, {
        method: 'POST',
        url: base + '?action=' + action + '&name=' + proxy,
        auth: self.account,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: zip
      } );

    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        if ( deploy ) {
          return self.deployRevision( proxy, JSON.parse( body ).revision );
        } else {
          return JSON.parse( body );
        }

      }

      throw apiError( 'Status ' + response.statusCode, body );

    } ) );

  },

  deployRevision: function ( proxy, revision ) {

    var self = this;

    debug( proxy );
    debug( revision );

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    var url = self.base( true ) +
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
      auth: self.account
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
  undeploy: function ( proxy, file ) {

    var self = this;
    var data;

    return this.deployments( proxy ).then( function ( revisions ) {
      return self.undeployRevisions( proxy, revisions );
    } ).then( function ( data_ ) {
      data = data_;
      if ( file ) return nfcall( fs.writeFile, file, JSON.stringify( data ) );
    } ).then( function () {
      return data;
    } );

  },

  undeployRevisions: function ( proxy, revisions, undeployed ) {

    undeployed = undeployed || [];

    if ( revisions.length === 0 ) return Promise.resolve( { revisions: undeployed } );

    var self = this;
    var revision = revisions.pop();

    var url = self.base( true ) +
      '/' + proxy +
      '/revisions/' + revision +
      '/deployments';

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: self.account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        undeployed.push( revision );
        return self.undeployRevisions( proxy, revisions, undeployed );
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

  },

  deployments: function ( proxy ) {

    var self = this;

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var url = self.base() +
      '/' + proxy +
      '/deployments';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: self.account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 ) {

        var env = JSON.parse( body ).environment.filter( function ( e ) {
          return e.name === self.account.env;
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

  redeploy: function ( proxy, file ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !file ) throw new Error( 'Missing redeployment file' );

    var self = this;

    return nfcall( fs.readFile, file ).then( function ( body ) {
      return self.redeployRevisions( proxy, JSON.parse( body ).revisions );
    } );

  },

  redeployRevisions: function ( proxy, revisions, all ) {

    all = all || revisions.slice( 0 );

    if ( !revisions ) throw new Error( 'Missing redeployment revisions' );
    if ( revisions.length === 0 ) return Promise.resolve( { revisions: all } );

    var self = this;

    return this.deployRevision( proxy, revisions.pop() )
      .then( function () {
        return self.redeployRevisions( proxy, revisions, all );
      } );

  },

  remove: function ( proxy ) {

    var self = this;

    return this.undeploy( proxy ).then( del, del );

    function del() {
      return self.delete( proxy );
    }

  },

  delete: function ( proxy ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var self = this;
    var url = self.base() + '/' + proxy;

    return nfcall( request, {
      method: 'DELETE',
      url: url,
      auth: self.account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 404 ) {
        return { ok: true };
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

  },

  bundle: function ( source, dest ) {

    if ( !source ) throw new Error( 'Missing source' );
    if ( !dest ) throw new Error( 'Missing destination' );

    return proxyZip( source ).then( function ( zip ) {
      return new Promise( function ( resolve, reject ) {
        zip.pipe( fs.createWriteStream( dest ) )
          .on( 'finish', function () { resolve( { ok: true } ); } )
          .on( 'error', reject );
      } );
    } );
  },

  download: function ( proxy, revision, out ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );
    if ( !out ) throw new Error( 'Missing output file' );

    var self = this;
    var url = self.base() + '/' + proxy + '/revisions/' + revision + '?format=bundle';

    return new Promise( function ( resolve, reject ) {

      var req = request( {
        method: 'GET',
        url: url,
        auth: self.account
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

  checksum: function ( source ) {

    if ( !source ) throw new Error( 'Missing source' );

    return proxyChecksum( source );

  },

  remoteChecksum: function ( proxy, revision ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );
    if ( !revision ) throw new Error( 'Missing revision' );

    var self = this;
    var url = self.base() + '/' + proxy + '/revisions/' + revision +
      '/resourcefiles/jsc/checksum.js';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: self.account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        return body;
      }

      return 'unknown';

    } ) );

  },

  revisions: function ( proxy ) {

    if ( !proxy ) throw new Error( 'Missing proxy' );

    var self = this;
    var url = self.base() + '/' + proxy + '/revisions';

    return nfcall( request, {
      method: 'GET',
      url: url,
      auth: self.account
    } ).then( spread( function ( response, body ) {

      if ( response.statusCode === 200 ) {
        return { revisions: JSON.parse( body ) };
      } else {
        throw apiError( 'Error ' + response.statusCode, body );
      }

    } ) );

  },

  base: function ( withEnv ) {

    var account = this.account;
    if ( !account ) throw new Error( 'Missing account' );
    if ( !account.org ) throw new Error( 'Missing account organization' );
    if ( !account.env ) throw new Error( 'Missing account environment' );

    var base = account.url.replace( /\/+$/, '' );
    base += '/v1/o/' + account.org;
    if ( withEnv ) base += '/e/' + account.env;
    base += '/apis';

    return base;

  }

} );
