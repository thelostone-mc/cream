# C.R.E.A.M

[![Actions Status](https://github.com/couger-inc/cream/workflows/cream%20contract%20test/badge.svg)](https://github.com/couger-inc/cream/actions)

Confidential Reliable Ethereum Anonymous Mixer

## Requirement

* node v10.*
* jq

## Setup

Create `default.json` file and edit your `MerkleTree` height and `Denomination`.

Example:
```bash
$ cp .sample.json ./config/default.json
$ vi ./config/default.json
# edit your settings....

# sample default.json setting
$ cat ./config/default.json
{
  "MERKLE_TREE_HEIGHT": 4,
  "DENOMINATION": "100000000000000000",
  "RECIPIENTS": [
    "0x65A5B0f4eD2170Abe0158865E04C4FF24827c529",
    "0x9cc9C78eDA7c7940f968eF9D8A90653C47CD2a5e",
    "0xb97796F8497bb84C63e650E9527Be587F18c09f8"
  ],
  "ZERO_VALUE": "2558267815324835836571784235309882327407732303445109280607932348234378166811"
}
```

```bash
$ npm install
$ npm run bootstrap && build:lerna
$ ganache-cli

# another process
$ npm run build
```

## Test

```bash
$ npm run test
```

if you get an error after `npm run test`, such as `Error: Cannot find module 'worker_threads'`, please run following command.

```bash
$ export NODE_OPTIONS=--experimental-worker
```