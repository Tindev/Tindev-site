# Tindev

## Local serving

Run `yarn run serve` to inspect the browser locally.

## Building with docker

Run `docker build -t polymer-nginx .` to build a Docker image.
Run `docker run -p 80:80 polymer-nginx` to start the Docker image.
You can then open `localhost:80` in your browser and inspect the website.

## Deploying to server

You need rights to the Docker hub

- Run `docker build -t polymer-nginx .` to build a Docker image.
- Run `docker tag polymer-nginx gweterings/polymer-nginx:latest` to tag the new build as the latests official.
- Run `docker push gweterings/polymer-nginx:latest` to push the new image to docker hub.

On the server,
- Run `docker stop gweterings/polymer-nginx`
- Run `docker pull gweterings/polymer-nginx:latest`
- Run `docker run -d -p 80:80 gweterings/polymer-nginx:latest`
