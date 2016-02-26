module.exports = usage;

function usage() {
  return [
    'edge config url <url>',
    'edge config user <user>',
    'edge config password <password>',
    'edge o/<org>/e/<env>/r',
    'edge o/<org>/e/<env>/r/<type>/<name>',
    'edge o/<org>/e/<env>/r/<type>/<name> upload <source>',
    'edge o/<org>/e/<env>/r/<type>/<name> delete',
    'edge o/<org>/e/<env>/t',
    'edge o/<org>/e/<env>/t/<name>',
    'edge o/<org>/e/<env>/t/<name> upload <source>',
    'edge o/<org>/e/<env>/t/<name> delete',
  ].join( '\n' );
}
