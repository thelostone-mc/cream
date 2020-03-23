#!/bin/bash

set -eu

cd $(dirname $0)
cd ../../
PROJECT_DIR=$PWD

CIRCUITS_DIR=$PROJECT_DIR/circuits/circom
BUILD_CIRCUITS_DIR=$PROJECT_DIR/build/circuits
CONTRACTS_DIR=$PROJECT_DIR/contracts/contracts
CONFIG_DIR=$CONTRACTS_DIR/config

# setup node options
export NODE_OPTIONS=--experimental-worker

# create alias for sed depends on os
shopt -s expand_aliases
make_sed_alias() {
  if sed --version 2>/dev/null | grep -q GNU; then
    alias sedi='sed -i ' # linux
  else
    alias sedi='sed -i "" ' # darwin
  fi
}
make_sed_alias

# check if default.json file exists
if [[ ! -f $CONFIG_DIR/default.json ]]; then
  echo "No such file found. Exiting..."
  exit 0
else
  MERKLE_TREE_HEIGHT=$(cat $CONFIG_DIR/default.json | jq .MERKLE_TREE_HEIGHT)
  sedi -e "$ s/.*/component main = Vote($MERKLE_TREE_HEIGHT);/" $CIRCUITS_DIR/vote.circom
fi

# check if buid circuits directory exists
if [[ ! -e $BUILD_CIRCUITS_DIR ]]; then
  mkdir -p $BUILD_CIRCUITS_DIR
fi

# circuit compile
# create output file: vote.json
npx circom $CIRCUITS_DIR/vote.circom -o $BUILD_CIRCUITS_DIR/vote.json &>/dev/null

# optional: showing cuicuit information
#npx snarkjs info -c $BUILD_CIRCUITS_DIR/vote.json

# setup with groth16
# create output files: vote_proving_key.json vote_verification_key.json
npx snarkjs setup --protocol groth -c $BUILD_CIRCUITS_DIR/vote.json --pk $BUILD_CIRCUITS_DIR/vote_proving_key.json --vk $BUILD_CIRCUITS_DIR/vote_verification_key.json

# build public key bin file
# create output file: vote_proving_key.bin
node $PROJECT_DIR/circuits/node_modules/websnark/tools/buildpkey.js -i $BUILD_CIRCUITS_DIR/vote_proving_key.json -o $BUILD_CIRCUITS_DIR/vote_proving_key.bin

# check if build contracts directory exists
if [[ ! -e $CONTRACTS_DIR ]]; then
  mkdir -p $CONTRACTS_DIR
fi

# generate verifier contract
# create output file: Verifier.sol
npx snarkjs generateverifier -v $CONTRACTS_DIR/Verifier.sol --vk $BUILD_CIRCUITS_DIR/vote_verification_key.json
