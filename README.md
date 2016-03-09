# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
organization/environment resource files and target servers.

## Installation

Clone this repo and run `npm install . -g`
to make `edge` available in your PATH.

## Synopsis

```
// create/configure accounts
// config is written to .edge in your home directory
// do this once for every combination you're using
edge account list
edge account create <name> <url> <user> <password> <org> <env>
edge account set <name> <url> <user> <password> <org> <env>
edge account remove <name>

// manage resources
edge <account> resource list
edge <account> resource get <type>/<name>
edge <account> resource deploy <source> <type>/<name>
edge <account> resource delete <type>/<name>

// manage target servers
edge <account> targetServer list
edge <account> targetServer get <name>
edge <account> targetServer deploy <source> <name>
edge <account> targetServer delete <name>

// manage proxies
// <source> is a path to a proxy bundle
// <name> is the API proxy name

// validate proxy bundle
edge <account> proxy validate <source> <name>

// overwrite currently deployed revision with <source> and deploy
// only do this in development environments
edge <account> proxy update <source> <name>

// undeploy existing revision
// upload <source> as new revision
// deploy new revision
edge <account> proxy deploy <source> <name>
```

## Examples

```
// this is the base management api url for the test environment
edge account create test http://apiproxy-admin-test:8080 user@md.de secret md test-online

// to get the target servers of organization 'md' and environment 'test-online'
edge test-online targetServer list

// to create a new target server
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

To run the tests you need a real (dev) config set up using `edge account create ...`.
You have to export `EDGE_CLI_TEST` when running the tests:

```
EDGE_CLI_TEST=<account> npm test
```
