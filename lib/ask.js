var readline = require( 'readline' );
var stream = require( 'stream' );

module.exports = process.ask = process.ask || function ( question, options ) {

  options = options || {};

  process.question = ( process.question || Promise.resolve() ).then( function () {

    return new Promise( function ( resolve, reject ) {

      var rl = readline.createInterface( {
        input: process.ask.input,
        output: options.hidden ? null : process.ask.output,
        terminal: true
      } );

      if ( options.hidden ) process.ask.output.write( question );

      rl.question( question, function ( answer ) {
        if ( options.hidden ) process.ask.output.write( '\n' );
        rl.close();
        resolve( answer );
      } );

    } );

  } );

  return process.question;

};

process.ask.input = process.stdin;
process.ask.output = process.stdout;
