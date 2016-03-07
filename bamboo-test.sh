npm install
mkdir -p reports
bin/edge ${bamboo.account} config set url ${bamboo.url}
bin/edge ${bamboo.account} config set user ${bamboo.user}
bin/edge ${bamboo.account} config set password ${bamboo.password}
bin/edge ${bamboo.account} config set org ${bamboo.org}
bin/edge ${bamboo.account} config set env ${bamboo.env}
EDGE_CLI_TEST=${bamboo.account} node node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha test -- -R xunit > reports/TEST-all.xml
