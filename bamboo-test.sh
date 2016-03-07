npm install
mkdir -p reports
bin/edge $BAMBOO_ACCOUNT config set url $BAMBOO_URL
bin/edge $BAMBOO_ACCOUNT config set user $BAMBOO_USER
bin/edge $BAMBOO_ACCOUNT config set password $BAMBOO_PASSWORD
bin/edge $BAMBOO_ACCOUNT config set org $BAMBOO_ORG
bin/edge $BAMBOO_ACCOUNT config set env $BAMBOO_ENV
EDGE_CLI_TEST=$BAMBOO_ACCOUNT XUNIT_FILE=reports/TEST-all.xml node node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha test -- -R xunit-file
