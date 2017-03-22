# Build with:
# $ docker build -t polymer-nginx .
FROM nginx:alpine

MAINTAINER Gijs Weterings <info@gijsweterings.nl>

USER root

RUN apk --no-cache add nodejs git curl && \
    apk --update add tar
    
RUN curl -o- -L https://yarnpkg.com/install.sh | sh 
ENV PATH "$PATH:$HOME/.yarn/bin"

RUN mkdir -p /home/${user}/app

VOLUME /home/${user}/app
WORKDIR /home/${user}/app

COPY config/nginx/nginx.list /etc/apt/sources.list.d/nginx.list
COPY config/nginx/nginx_signing.key /tmp/nginx_signing.key

RUN export PATH="$HOME/.yarn/bin:$PATH" && \
    yarn global add gulp bower polymer-cli

COPY config/nginx/nginx.conf /etc/nginx/nginx.conf

COPY . /opt/tindev-site

WORKDIR /opt/tindev-site

RUN export PATH="$HOME/.yarn/bin:$PATH" && \
    yarn && \
    bower install --allow-root && \
    polymer build

EXPOSE 80
EXPOSE 443

CMD ["nginx"]
