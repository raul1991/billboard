# VaultViewer

A web application to view the vault database.

## How to run it ?

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## How to use it ?

Run your vault database locally, provide the root token or the dev token to access the contents.

## Use it with docker

### Pull the image from the hub 

`docker pull cafebabe1991/vault-viewer:v1`

### Run the downloaded docker image

`docker run -p 9000:9000 -p 9001:9001 cafebabe1991/vault-viewer:v1`

## How to contribute ?

Solve [issues](https://github.com/raul1991/vault-viewer/issues?q=is%3Aissue+is%3Aopen) or raise some.
