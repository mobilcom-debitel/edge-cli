module.exports = apiError;

function apiError( message, payload ) {
  var err = new Error( message );
  try {
    if ( typeof payload === 'string' ) payload = JSON.parse( payload );
  } catch ( ex ) {
    // ignore
  }
  err.payload = payload;
  return err;
}
