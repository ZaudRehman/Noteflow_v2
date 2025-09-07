use axum::{
    routing::{get, post, put, delete},
    Router, Extension,
};
use uuid::Uuid;
use crate::{auth, db, ws};
use sqlx::PgPool;
use redis::Client as RedisClient;
use tokio::sync::broadcast;

pub fn create_routes() -> Router {
    // Broadcast channel for WebSocket notifications
    let (tx, _) = broadcast::channel(100);

    Router::new()
        // Auth endpoints
        .route("/api/signup", post(auth::signup))
        .route("/api/login", post(auth::login))

        // Notes CRUD 
        .route("/api/notes/:user_id", get(db::list_notes))
        .route("/api/notes", post(db::create_note))
        .route("/api/notes/:note_id", get(db::get_note).put(db::update_note).delete(db::delete_note))

        // WebSocket for collaborative sync
        .route("/api/notes/:note_id/ws", get(ws::note_ws))
        .layer(Extension(tx))
}
