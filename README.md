# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
environment resource files and target servers.

## Installation

`npm install git+https://git@stashweb.mobilcom.de/scm/api/edge-cli.git -g`

## Synopsis

```
// create/configure accounts
// config is written to .edge in your home directory
// do this once for every combination you're using
edge account list
edge account create <name> <url> <user> <password> <org> <env>
edge account set <name> url|user|password|org|env <value>
edge account delete <name>

// manage resources
// <source> is a path to a resource file
edge <account> resource list
edge <account> resource get <type>/<name>
edge <account> resource deploy <source> <type>/<name>
edge <account> resource delete <type>/<name>

// manage target servers
// <source> is a path to a xml or json target server
edge <account> targetServer list
edge <account> targetServer get <name>
edge <account> targetServer deploy <source> <name>
edge <account> targetServer delete <name>

// manage proxies
// <source> is a path to a proxy bundle directory (edge-cli will zip for you)
// <name> is the API proxy name

// validate proxy
edge <account> proxy validate <source> <name>

// overwrite currently deployed revision with <source> and deploy
// WARNING: only do this in development environments
edge <account> proxy update <source> <name>

// undeploy existing revision(s)
// upload <source> as new revision
// deploy new revision
edge <account> proxy deploy <source> <name>

// undeploy existing revision(s)
edge <account> proxy undeploy <name>

// undeploy, write undeployed revisions to a file, and redeploy original revisions
// useful for undeploying a proxy temporarily, e.g. for maintenance
edge <account> proxy undeploy <name> redeploy.json // writes to redeploy.json
edge <account> proxy redeploy <name> redeploy.json // reads from redeploy.json

// completely remove a proxy
edge <account> proxy remove <name>
```

## Examples

```
// basic configuration
edge account create test http://apiproxy-admin-test:8080 user@md.de secret md test-online

// list target servers of organization 'md' and environment 'test-online'
edge test-online targetServer list

// deploy a target server
edge test-online targetServer deploy gen_chathistory_0.json GEN_CHATHISTORY_0

// with gen_chathistory_0.json being
{
  "host" : "xxxx",
  "isEnabled" : false,
  "name" : "GEN_CHATHISTORY_0",
  "port" : 9000
}

// xml works as well
<TargetServer name="GEN_CHATHISTORY_0">
  <Host>xxxx</Host>
  <Port>9000</Port>
  <IsEnabled>false</IsEnabled>
</TargetServer>
```

See [Load balancing across backend servers (Apigee)]( http://docs.apigee.com/docs/api-services/content/api-services/content/load-balancing-across-backend-servers) for details on target servers.

## Tests

To run the tests you need a real (dev) account set up using `edge account create ...`.
You have to export `EDGE_CLI_TEST` when running the tests:

```
EDGE_CLI_TEST=<account> npm test
```
