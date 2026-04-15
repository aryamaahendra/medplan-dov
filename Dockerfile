# Stage 1: Base PHP image with extensions
FROM dunglas/frankenphp:php8.4 AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    ca-certificates \
    gnupg \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    postgresql-client \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install PHP extensions
RUN install-php-extensions \
    pcntl \
    gd \
    intl \
    zip \
    pdo_pgsql \
    redis \
    bcmath \
    opcache

# Stage 2: Composer dependencies
FROM base AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

# Stage 3: Frontend assets
FROM base AS frontend

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Wayfinder needs the vendor folder and app code to generate types
COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN npm run build

# Stage 4: Final production image
FROM base AS final

ARG UID=1000
ARG GID=1000

# Create a non-root user
RUN groupadd --gid ${GID} laravel && \
    useradd --uid ${UID} --gid ${GID} --shell /bin/bash --create-home laravel

WORKDIR /app

# Copy application files
COPY --chown=laravel:laravel . .
COPY --from=vendor --chown=laravel:laravel /app/vendor ./vendor
COPY --from=frontend --chown=laravel:laravel /app/public/build ./public/build

# Create bootstrap/cache and storage subdirectories, then set permissions
RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs && \
    rm -f bootstrap/cache/*.php && \
    chown -R laravel:laravel storage bootstrap/cache

# Switch to non-root user
USER laravel

# Set up environment
ENV OCTANE_SERVER=frankenphp
ENV FRANKENPHP_CONFIG="worker ./public/index.php"

# Expose the default FrankenPHP port
EXPOSE 8000

# Entrypoint script
COPY --chown=laravel:laravel docker/prod/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
