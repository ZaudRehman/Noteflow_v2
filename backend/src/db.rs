use axum::{extract::{Extension, Json, Path}, response::IntoResponse, http::StatusCode};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::Note;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateNoteRequest {
    pub user_id: Uuid,
    pub title: String,
    pub body: String,
    pub tags: Vec<String>,
}

#[derive(Deserialize)]
pub struct UpdateNoteRequest {
    pub title: Option<String>,
    pub body: Option<String>,
    pub tags: Option<Vec<String>>,
}

pub async fn create_note(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<CreateNoteRequest>,
) -> impl IntoResponse {
    let note_id = Uuid::new_v4();
    let now = Utc::now();

    let res = sqlx::query_as!(
        Note,
        r#"
        INSERT INTO notes (id, user_id, title, body, revision, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, title, body, revision, tags, created_at, updated_at;
        "#,
        note_id,
        payload.user_id,
        payload.title,
        payload.body,
        1_i64,
        &payload.tags,
        now,
        now
    )
    .fetch_one(&pool)
    .await;

    match res {
        Ok(note) => (StatusCode::CREATED, Json(note)),
        Err(e) => {
            tracing::error!("Create note error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create note")
        }
    }
}

pub async fn list_notes(
    Extension(pool): Extension<PgPool>,
    Path(user_id): Path<Uuid>,
) -> impl IntoResponse {
    let res = sqlx::query_as!(
        Note,
        "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC",
        user_id
    )
    .fetch_all(&pool)
    .await;

    match res {
        Ok(notes) => (StatusCode::OK, Json(notes)),
        Err(e) => {
            tracing::error!("List notes error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to list notes")
        }
    }
}

pub async fn get_note(
    Extension(pool): Extension<PgPool>,
    Path(note_id): Path<Uuid>,
) -> impl IntoResponse {
    let res = sqlx::query_as!(
        Note,
        "SELECT * FROM notes WHERE id = $1",
        note_id
    )
    .fetch_optional(&pool)
    .await;

    match res {
        Ok(Some(note)) => (StatusCode::OK, Json(note)),
        Ok(None) => (StatusCode::NOT_FOUND, "Note not found"),
        Err(e) => {
            tracing::error!("Get note error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to get note")
        }
    }
}

pub async fn update_note(
    Extension(pool): Extension<PgPool>,
    Path(note_id): Path<Uuid>,
    Json(payload): Json<UpdateNoteRequest>,
) -> impl IntoResponse {
    // Retrieve existing note
    let note = sqlx::query_as!(
        Note,
        "SELECT * FROM notes WHERE id = $1",
        note_id
    )
    .fetch_optional(&pool)
    .await;

    if let Err(e) = note {
        tracing::error!("Update note retrieval error: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to retrieve note");
    }

    let mut note = note.unwrap();
    if note.is_none() {
        return (StatusCode::NOT_FOUND, "Note not found");
    }
    let mut note = note.unwrap();

    // Update fields if present
    if let Some(title) = payload.title {
        note.title = title;
    }
    if let Some(body) = payload.body {
        note.body = body;
    }
    if let Some(tags) = payload.tags {
        note.tags = tags;
    }
    note.revision += 1;
    note.updated_at = Utc::now();

    let res = sqlx::query!(
        r#"
        UPDATE notes SET title = $1, body = $2, revision = $3, tags = $4, updated_at = $5
        WHERE id = $6
        "#,
        note.title,
        note.body,
        note.revision,
        &note.tags,
        note.updated_at,
        note.id
    )
    .execute(&pool)
    .await;

    match res {
        Ok(_) => (StatusCode::OK, Json(note)),
        Err(e) => {
            tracing::error!("Update note DB error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update note")
        }
    }
}

pub async fn delete_note(
    Extension(pool): Extension<PgPool>,
    Path(note_id): Path<Uuid>,
) -> impl IntoResponse {
    let res = sqlx::query!("DELETE FROM notes WHERE id = $1", note_id)
        .execute(&pool)
        .await;

    match res {
        Ok(_) => (StatusCode::NO_CONTENT, ""),
        Err(e) => {
            tracing::error!("Delete note error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete note")
        }
    }
}
