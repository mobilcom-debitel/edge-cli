module.exports = spread;

function spread( fn, context ) {
  return function ( args ) {
    return fn.apply( context, args );
  };
}
