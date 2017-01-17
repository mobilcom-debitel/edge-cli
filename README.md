# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
environment resource files and target servers as well as advanced proxy deployments.
Useful for CI/CD and offline proxy development.

Reduces number of uploaded proxy revisions by comparing and reusing revisions by checksum.

Tested with **Apigee Edge 4.16.05.00 (On-Premise)**.

## Installation

`npm install edge-cli -g`

## Usage

```bash
# Show help
edge help

# Show version
edge version

# Manage accounts on your machine
# Accounts are tuples of:
# (URL to management API, Username, Password, Organization, Environment)
#
# Config is written to .edge in your home directory
# You can specify a different file with EDGE_CLI_CONF=/my/.edge
# Do this once for every combination you're using
edge account list
edge account setup <name> # interactive mode, new or existing accounts
edge account setup <name> <url> <username> <password> <org> <env>
edge account set <name> url|username|password|org|env <value>
edge account delete <name>

# Most commands require an apigee edge account
# Specify the account name with -a or --account
edge <command> -a <account>
edge <command> --account <account>

# Manage resources
# <source> is a path to a resource file
edge resource list
edge resource get <type>/<name>
edge resource deploy <source> <type>/<name>
edge resource delete <type>/<name>

# Manage target servers
# <source> is a path to a xml or json target server
edge targetServer list
edge targetServer get <name>
edge targetServer deploy <source> <name>
edge targetServer delete <name>

# Manage proxies
# <source> is a path to a proxy bundle directory (edge-cli will zip for you)
# <name> is the API proxy name

# Validate proxy
edge proxy validate <source> <name>

# Deploy new or existing revision
# Before that, undeploy existing revision(s) and upload <source> as new revision
# OR skip upload if any existing revision is identical via checksum
edge proxy deploy <source> <name>

# Undeploy existing revision(s)
edge proxy undeploy <name>

# Overwrite <revision> with <source>
# Upload is skipped if the revision is identical via checksum
# Useful for development:
# Pick a development revision number and only update that
edge proxy updateRevision <source> <name> <revision>

# Deploy specific revision
edge proxy deployRevision <name> <revision>

# Completely remove a proxy
edge proxy remove <name>

# Generate an API policy from a Swagger file
# The policy stores the Swagger data in the "api" variable
# In a proxy response flow, the policy also writes the Swagger JSON to the response body
# - <target>/policies/api.xml
# - <target>/resources/jsc/api.js
# <swagger> defaults to "swagger.yaml"
# <target> defaults to "apiproxy"
edge generate apiPolicy <swagger> <target>
```

## Examples

```bash
# Basic configuration
edge account setup test # interactively setup a "test" account
edge account setup test http://apiproxy-admin-test:8080 username@md.de secret md dev

# Deploy a proxy
# Deployment is idempotent; revisions are compared and reused by checksum
edge proxy deploy apiproxy myproxy -a dev
edge proxy deploy apiproxy myproxy -a dev # no changes if proxy is not changed

# List target servers of organization 'md' and environment 'dev'
edge targetServer list -a dev

# Deploy a target server
edge targetServer deploy myTargetServer.json MY_TARGET_SERVER -a dev

# with myTargetServer.json being
# {
#   "host" : "xxxx",
#   "isEnabled" : false,
#   "name" : "MY_TARGET_SERVER",
#   "port" : 9000
# }

# xml works as well
# <TargetServer name="MY_TARGET_SERVER">
#   <Host>xxxx</Host>
#   <Port>9000</Port>
#   <IsEnabled>false</IsEnabled>
# </TargetServer>
```

See [Load balancing across backend servers (Apigee)]( http://docs.apigee.com/docs/api-services/content/api-services/content/load-balancing-across-backend-servers) for details on target servers.

## Tests

To run tests you need a real (dev) account set up using `edge account setup ...`.
You have to export `ACCOUNT` and `URL` (the base URL of the Edge environment)
when running the tests, for example:

```
ACCOUNT=dev URL=http://api-dev.foo.bar npm test
```

**Note:** The tests compute checksums over their fixtures
which are only valid if all files in `test/apiproxy` are LF-based.
Use `git config core.autocrlf input` to pull LFs correctly.
