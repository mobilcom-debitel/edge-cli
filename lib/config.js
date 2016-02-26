var readFile = require( './readFile' );
var writeFile = require( './writeFile' );
var debug = require( 'debug' )( 'edge-cli:config' );

module.exports = config;

function config( key, value ) {

  debug( key + ' ' + value );

  return readFile( './.edge' )
    .then( function ( config ) {
      return JSON.parse( config );
    } )
    .catch( function ( err ) {
      debug( err );
      return {};
    } )
    .then( function ( config ) {
      if ( !key ) throw new Error( 'Missing key' );
      if ( !value ) return config[ key ];

      config[ key ] = value;
      return writeFile( '.edge', JSON.stringify( config ) )
        .then( function () {
          return 'OK';
        } );
    } );

}
