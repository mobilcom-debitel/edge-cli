module.exports = usage;

function usage() {
  console.log( 'edge config url <url>' );
  console.log( 'edge config user <user>' );
  console.log( 'edge config password <password>' );
  console.log( 'edge o/<org>/e/<env>/r' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name>' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name> upload <source>' );
  console.log( 'edge o/<org>/e/<env>/r/<type>/<name> delete' );
  console.log( 'edge o/<org>/e/<env>/t' );
  console.log( 'edge o/<org>/e/<env>/t/<name>' );
  console.log( 'edge o/<org>/e/<env>/t/<name> upload <source>' );
  console.log( 'edge o/<org>/e/<env>/t/<name> delete' );
}
