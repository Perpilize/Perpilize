#!/bin/bash

set -e

CHAIN_ID="perpilize-1"
HOME_DIR="$HOME/.perpilized"

echo "Cleaning old state..."
rm -rf $HOME_DIR

echo "Initializing chain..."
perpilized init local-node --chain-id $CHAIN_ID

echo "Copying genesis..."
cp config/genesis.json $HOME_DIR/config/genesis.json

echo "Starting node..."
perpilized start