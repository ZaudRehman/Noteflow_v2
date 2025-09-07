# Stage 1: Build
FROM rust:1.75 as builder
WORKDIR /usr/src/app

# Copy source code
COPY ./backend/Cargo.toml ./backend/Cargo.lock ./backend/
COPY ./backend/src ./backend/src

WORKDIR /usr/src/app/backend

# Build release binary
RUN cargo build --release

# Stage 2: Runtime
FROM debian:buster-slim
WORKDIR /usr/src/app

# Copy binary and .env
COPY --from=builder /usr/src/app/backend/target/release/noteflow_v2_backend ./noteflow_v2_backend
COPY ./backend/.env .env

# Expose port 8080 to host
EXPOSE 8080

# Run the backend server
CMD ["./noteflow_v2_backend"]
