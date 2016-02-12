# Apigee Edge Command Line Interface

A CLI with support for features missing in the Edge UI like managing
organization/environment resource files and target servers.
Use with caution.

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
edge o/<org>/e/<env>/t/<name> upload <source>
edge o/<org>/e/<env>/t/<name> delete
```
