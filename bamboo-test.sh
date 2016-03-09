npm install
mkdir -p reports
EDGE_CLI_CONF=./.edge node bin/edge account create $bamboo_account $bamboo_url $bamboo_user $bamboo_password $bamboo_org $bamboo_env
EDGE_CLI_CONF=./.edge EDGE_CLI_TEST=$bamboo_account XUNIT_FILE=reports/TEST-all.xml node node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha test -- -R xunit-file
