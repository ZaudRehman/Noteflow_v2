mod auth;
mod db;
mod errors;
mod models;
mod routes;
mod utils;
mod ws;

use axum::{Extension, Router};
use dotenv::dotenv;
use redis::Client as RedisClient;
use sqlx::PgPool;
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env
    dotenv().ok();

    // Init logging
    tracing_subscriber::fmt::init();

    // Read env
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");

    // Postgres pool
    let pg_pool = PgPool::connect(&database_url).await?;
    tracing::info!("Connected to PostgreSQL");

    // Redis client
    let redis_client = RedisClient::open(redis_url.as_str())?;
    tracing::info!("Connected to Redis");

    // WebSocket broadcast channel (buffer 100)
    let (tx, _rx): (broadcast::Sender<ws::WsMessage>, broadcast::Receiver<ws::WsMessage>) =
        broadcast::channel(100);

    // CORS (development-wide allow; restrict for prod)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .merge(routes::create_routes())
        .layer(cors)
        .layer(Extension(pg_pool))
        .layer(Extension(redis_client))
        .layer(Extension(tx));

    // Bind and serve using axum::serve (hyper 1-compatible)
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server listening on {}", addr);

    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
