# Use the official Nginx base image
FROM nginx:latest

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Remove default Nginx files
RUN rm -rf ./*

# Copy custom Nginx configuration file
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy website files into the container
COPY /* /usr/share/nginx/html

# Expose HTTP (80) and HTTPS (443) ports
EXPOSE 80 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
