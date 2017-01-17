var pack = require( '../package.json' );

module.exports = version;

function version() {
  return Promise.resolve( pack.version );
}
