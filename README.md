Anow Address Geomapper
======================

A small NodeJS utility that loops through database Appraisal records, hits the
Google Maps Geocoding API, and updates the Appraisal table's latitude/longitude
values for each row's individual address data.

## Quick Start

```sh
$ git clone https://github.com/fated-x/an-address-geomapper.git
$ npm install
```

You can run the script in one of 2 ways:

```sh
$ ./index.js --env dev
```

or using npm.
**Note:** This should only be used when running against the 'dev' environment.

```sh
$ npm run geomap --env dev
```

If you omit the `--env dev`, the 'dev' environment/database will be used by default.
Possible options for the `env` param include:
- dev
- staging
- prod

#### Run the script with debug comments

```sh
$ DEBUG=anowDB,geomap npm run geomap --env dev
```
