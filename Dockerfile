FROM node:20 AS node

WORKDIR /app

# Copy full application code into working directory
COPY package-lock.json package-lock.json
COPY package.json package.json

# Install all dependencies of angular application
RUN  --mount=type=secret,id=npm_user_config,target=/root/.npmrc npm install --verbose

COPY . .

# Build Angular application
RUN npm run build --configuration=production

# stage 2
FROM nginx:1.25.0-alpine-slim
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*
COPY --from=node /app/dist/fhir-ui .
COPY config/config.template.json /usr/share/nginx/config.template.json

RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid

EXPOSE 8080
USER nginx

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/browser/config/config.json && exec nginx"]