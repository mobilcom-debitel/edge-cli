npm install
mkdir -p reports
EDGE_CLI_CONF=.edge bin/edge $BAMBOO_ACCOUNT config set url $BAMBOO_URL
EDGE_CLI_CONF=.edge bin/edge $BAMBOO_ACCOUNT config set user $BAMBOO_USER
EDGE_CLI_CONF=.edge bin/edge $BAMBOO_ACCOUNT config set password $BAMBOO_PASSWORD
EDGE_CLI_CONF=.edge bin/edge $BAMBOO_ACCOUNT config set org $BAMBOO_ORG
EDGE_CLI_CONF=.edge bin/edge $BAMBOO_ACCOUNT config set env $BAMBOO_ENV
EDGE_CLI_TEST=$BAMBOO_ACCOUNT XUNIT_FILE=reports/TEST-all.xml node node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha test -- -R xunit-file
