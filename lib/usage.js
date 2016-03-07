module.exports = usage;

function usage() {
  return [
    'edge <account> config set url <url>',
    'edge <account> config set user <user>',
    'edge <account> config set password <password>',
    'edge <account> config set org <org>',
    'edge <account> config set env <env>',
    'edge <account> resources list',
    'edge <account> resources get <type>/<name>',
    'edge <account> resources deploy <source> <type>/<name>',
    'edge <account> resources delete <type>/<name>',
    'edge <account> targetServers list',
    'edge <account> targetServers get <name>',
    'edge <account> targetServers deploy <source>',
    'edge <account> targetServers delete <name>'
  ].join( '\n' );
}
