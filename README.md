# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
organization/environment resource files and target servers.

## Installation

Clone this repo and run `npm install . -g`
to make `edge` available in your PATH.

## Synopsis

```
// writes config to a .edge config file (working directory)
// you can also export EDGE_URL, EDGE_USER, EDGE_PASSWORD
// NOTE: Remember to add .edge to your .gitignore
edge config url <baseUrl>
edge config user <user>
edge config password <password>

// organization resource files
edge o/<org>/r
edge o/<org>/r/<type>
edge o/<org>/r/<type>/<name>
edge o/<org>/r/<type>/<name> upload <source>
edge o/<org>/r/<type>/<name> delete

// environment resource files
edge o/<org>/e/<env>/r
edge o/<org>/e/<env>/r/<type>/<name>
edge o/<org>/e/<env>/r/<type>/<name> upload <source>
edge o/<org>/e/<env>/r/<type>/<name> delete

// environment target servers
edge o/<org>/e/<env>/t
edge o/<org>/e/<env>/t/<name>
edge o/<org>/e/<env>/t/<name> upload <source> // source may be .xml or .json
edge o/<org>/e/<env>/t/<name> delete
```

## Examples

```
// this is the base management api url for the test environment
edge config url http://apiproxy-admin-test:8080

// to get the target servers of organization 'md' and environment 'test-online'
edge o/md/e/test-online/t

// to create a new target server
edge o/md/e/test-online/t/GEN_CHATHISTORY_0 upload gen_chathistory_0.json

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

To run the tests you need a real (dev) config set up using `edge config ...`.
You have to export `EDGE_CLI_TEST` when running the tests:

```
EDGE_CLI_TEST=o/md/e/dev-online npm test
```
