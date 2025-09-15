# ---------- Stage 1: Build ----------
FROM rust:1.76 AS builder
WORKDIR /usr/src/app

# Cache deps first to speed up rebuilds
COPY backend/Cargo.toml backend/Cargo.lock ./
# Create a dummy main to cache dependency compile
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
WORKDIR /usr/src/app/backend
RUN cargo build --release || true

# Now copy real source and build
RUN rm -f src/main.rs
COPY backend/src ./src
RUN cargo build --release

# ---------- Stage 2: Runtime ----------
# Use a slim base and install minimal TLS + certs
FROM debian:bullseye-slim
WORKDIR /app

# Install OpenSSL runtime & CA certs for TLS (Redis rediss://) and DNS, then clean
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl libc6 \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the release binary from builder
# Adjust the binary name if your Cargo package name differs
COPY --from=builder /usr/src/app/backend/target/release/backend ./backend

# Non-root user (optional but recommended)
RUN useradd -u 10001 -r -s /usr/sbin/nologin appuser \
    && chown appuser:appuser /app/backend
USER appuser

# Expose port
EXPOSE 8080

# Environment is passed at runtime; don't bake .env into the image
# Run
ENTRYPOINT ["./backend"]
