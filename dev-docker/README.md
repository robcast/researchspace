# Developing ResearchSpace using Docker

You can use the example docker-compose files in this directory to run the ResearchSpace build process in a Docker container on your development machine with no need to install specific versions of Node.js and Java.

## Installation

In the researchspace base directory (checked out from https://github.com/researchspace/researchspace) copy the docker-compose files and adjust if neccessary:

```
cp dev-docker/docker-compose.yml.example docker-compose.yml
cp dev-docker/docker-compose.override.yml.example docker-compose.override.yml
```

Build the local development base-image (containing webpack, this process can take some time):

```
docker compose build
```

## Running

Then start the gradle build process and the incremental compilation server in the background:

```
docker compose up -d
```

You can check the output of the gradle and researchspace process using:

```
docker logs --follow rs-dev
```

After the initial build process has completed you can access your researchspace instance at
http://localhost:10214

## Stopping

To stop the containers run:

```
docker compose stop
```

## Build WAR artefact

To create a WAR package in `build/libs/` run:

```
docker compose run --rm rs-dev war
```
