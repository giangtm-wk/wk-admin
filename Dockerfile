FROM nginx:1.25.4-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default web content
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built Angular app from dist folder (already built in CI)
COPY dist/wk-admin/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
