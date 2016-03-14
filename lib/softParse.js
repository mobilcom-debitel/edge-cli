module.exports = softParse;

function softParse( payload ) {
  try {
    return JSON.parse( payload );
  } catch ( ex ) {
    return { raw: payload };
  }
}
