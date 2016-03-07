module.exports = usage;

function usage() {
  return [
    'edge <account> config set url <url>',
    'edge <account> config set user <user>',
    'edge <account> config set password <password>',
    'edge <account> config set org <org>',
    'edge <account> config set env <env>',
    'edge <account> resource list',
    'edge <account> resource get <type>/<name>',
    'edge <account> resource deploy <source> <type>/<name>',
    'edge <account> resource delete <type>/<name>',
    'edge <account> targetServer list',
    'edge <account> targetServer get <name>',
    'edge <account> targetServer deploy <source> <name>',
    'edge <account> targetServer delete <name>',
    'edge <account> proxy validate <source> <name>',
    'edge <account> proxy deploy <source> <name>'
  ].join( '\n' );
}
