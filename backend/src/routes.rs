use crate::{auth, db, ws};
use axum::{
    routing::{get, post, put, delete},
    Extension, Router,
};
use tokio::sync::broadcast;

pub fn create_routes() -> Router {
    // Broadcast channel for WebSocket notifications (buffer 100)
    let (tx, _rx): (
        broadcast::Sender<ws::WsMessage>,
        broadcast::Receiver<ws::WsMessage>,
    ) = broadcast::channel(100);

    Router::new()
        // Auth endpoints
        .route("/api/signup", post(auth::signup))
        .route("/api/login", post(auth::login))
        // Notes CRUD
        .route("/api/users/{user_id}/notes", get(db::list_notes))
        .route("/api/notes", post(db::create_note))
        .route(
            "/api/notes/{note_id}",
            get(db::get_note)
                .put(db::update_note)
                .delete(db::delete_note),
        )
        // WebSocket for collaborative sync
        .route("/api/notes/{note_id}/ws", get(ws::note_ws))
        // Layer broadcast sender so ws handler can access it via Extension
        .layer(Extension(tx))
}
