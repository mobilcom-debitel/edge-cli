# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
organization/environment resource files and target servers.

## Installation

Clone this repo and run `npm install . -g`
to make `edge` available in your PATH.

## Synopsis

```
// create/configure account
// config is written to .edge in your home directory
// do this once for every combination you're using
edge <account> config set url <url>
edge <account> config set user <user>
edge <account> config set password <password>
edge <account> config set org <org>
edge <account> config set env <env>

// manage resources using account
edge <account> resource list
edge <account> resource get <type>/<name>
edge <account> resource deploy <source> <type>/<name>
edge <account> resource delete <type>/<name>

// manage target servers using account
edge <account> targetServer list
edge <account> targetServer get <name>
edge <account> targetServer deploy <source> <name>
edge <account> targetServer delete <name>

// manage proxies using account
// <source> is a path to a proxy bundle
// <name> is the API proxy name

// validate proxy bundle
edge <account> proxy validate <source> <name>

// undeploy existing revision
// upload <source> as new revision
// deploy new revision
edge <account> proxy deploy <source> <name>
```

## Examples

```
// this is the base management api url for the test environment
edge test config set url http://apiproxy-admin-test:8080
edge test config set org md
edge test config set env test-online

// to get the target servers of organization 'md' and environment 'test-online'
edge test targetServer list

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

To run the tests you need a real (dev) config set up using `edge <account> config set ...`.
You have to export `EDGE_CLI_TEST` when running the tests:

```
EDGE_CLI_TEST=<account> npm test
```
