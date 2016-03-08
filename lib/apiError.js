module.exports = apiError;

function apiError( message, payload ) {
  var err = new Error( message );
  err.payload = payload;
  return err;
}
