mod auth;
mod db;
mod errors;
mod models;
mod routes;
mod utils;
mod ws;

use axum::{
    Router,
    routing::get,
    Extension,
};
use dotenv::dotenv;
use sqlx::PgPool;
use redis::Client as RedisClient;
use redis::Commands;
use std::{env, net::SocketAddr};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize .env
    dotenv().ok();

    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt::init();

    // Get environment variables
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");

    // Create PostgreSQL connection pool with SQLx
    let pg_pool = PgPool::connect(&database_url).await?;
    tracing::info!("Connected to PostgreSQL");

    // Create Redis client
    let redis_client = RedisClient::open(redis_url.as_str())?;
    tracing::info!("Connected to Redis");

    // Broadcast channel for WebSocket message passing (buffer size 100)
    let (tx, _rx) = broadcast::channel::<ws::WsMessage>(100);

    // Setup CORS layer allowing all origins and common methods/headers - adjust for production
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build Axum router by merging routes module and adding shared state extensions
    let app = Router::new()
        .merge(routes::create_routes())
        .layer(cors)
        .layer(Extension(pg_pool))
        .layer(Extension(redis_client))
        .layer(Extension(tx));

    // Bind server to 0.0.0.0:8080 to listen on all interfaces on port 8080
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server listening on {}", addr);

    // Run Axum server with graceful shutdown
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
