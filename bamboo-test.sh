npm install
mkdir -p reports
EDGE_CLI_CONF=./.edge node bin/edge $bamboo_account config set url $bamboo_url
EDGE_CLI_CONF=./.edge node bin/edge $bamboo_account config set user $bamboo_user
EDGE_CLI_CONF=./.edge node bin/edge $bamboo_account config set password $bamboo_password
EDGE_CLI_CONF=./.edge node bin/edge $bamboo_account config set org $bamboo_org
EDGE_CLI_CONF=./.edge node bin/edge $bamboo_account config set env $bamboo_env
EDGE_CLI_CONF=./.edge EDGE_CLI_TEST=$bamboo_account XUNIT_FILE=reports/TEST-all.xml node node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha test -- -R xunit-file
