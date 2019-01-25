#!/bin/bash

#Starting the vault server
echo "Starting vault with ${VAULT_DEV_ROOT_TOKEN_ID} as root token..."
./vault server -dev &> vault.log &

# Starting ng server
echo "Starting the web application..."
ng serve --host "${NG_HOST}" --port "${NG_PORT}" &> ng.log &

sleep 10000
