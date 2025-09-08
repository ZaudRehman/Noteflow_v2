use crate::models::Note;
use axum::{
    extract::{Extension, Json, Path},
    http::StatusCode,
    response::IntoResponse,
    Json as AxumJson,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateNoteRequest {
    pub user_id: Uuid,
    pub title: String,
    pub body: String,
    pub tags: Vec<String>, // maps to TEXT[]; column has DEFAULT '{}' (non-null), but we keep Option in model for sqlx compatibility
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

    // sqlx bind for TEXT[] expects Option<&[String]> for a nullable array column
    let tags_opt: Option<&[String]> = Some(payload.tags.as_slice());

    let res = sqlx::query_as!(
        Note,
        r#"
        INSERT INTO notes (id, user_id, title, body, revision, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, title, body, revision, tags, created_at, updated_at
        "#,
        note_id,
        payload.user_id,
        payload.title,
        payload.body,
        1_i64,
        tags_opt,
        now,
        now
    )
    .fetch_one(&pool)
    .await;

    match res {
        Ok(mut note) => {
            // Model uses Option<Vec<String>>; normalize to Some(vec) for consistent API shape
            note.tags = Some(note.tags.unwrap_or_default());
            (StatusCode::CREATED, AxumJson(note)).into_response()
        }
        Err(e) => {
            tracing::error!("Create note error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Failed to create note"})),
            )
                .into_response()
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
        Ok(mut notes) => {
            for note in &mut notes {
                note.tags = Some(note.tags.clone().unwrap_or_default());
            }
            (StatusCode::OK, AxumJson(notes)).into_response()
        }
        Err(e) => {
            tracing::error!("List notes error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Failed to list notes"})),
            )
                .into_response()
        }
    }
}

pub async fn get_note(
    Extension(pool): Extension<PgPool>,
    Path(note_id): Path<Uuid>,
) -> impl IntoResponse {
    let res = sqlx::query_as!(Note, "SELECT * FROM notes WHERE id = $1", note_id)
        .fetch_optional(&pool)
        .await;

    match res {
        Ok(Some(mut note)) => {
            note.tags = Some(note.tags.unwrap_or_default());
            (StatusCode::OK, AxumJson(note)).into_response()
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            AxumJson(json!({"error":"Note not found"})),
        )
            .into_response(),
        Err(e) => {
            tracing::error!("Get note error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Failed to get note"})),
            )
                .into_response()
        }
    }
}

pub async fn update_note(
    Extension(pool): Extension<PgPool>,
    Path(note_id): Path<Uuid>,
    Json(payload): Json<UpdateNoteRequest>,
) -> impl IntoResponse {
    // Fetch existing
    let existing = sqlx::query_as!(Note, "SELECT * FROM notes WHERE id = $1", note_id)
        .fetch_optional(&pool)
        .await;

    let mut note = match existing {
        Ok(Some(note)) => note,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                AxumJson(json!({"error":"Note not found"})),
            )
                .into_response()
        }
        Err(e) => {
            tracing::error!("Update note retrieval error: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Error retrieving note"})),
            )
                .into_response();
        }
    };

    // Apply updates
    if let Some(title) = payload.title {
        note.title = title;
    }
    if let Some(body) = payload.body {
        note.body = body;
    }
    if let Some(tags) = payload.tags {
        note.tags = Some(tags);
    }

    note.revision += 1;
    note.updated_at = Utc::now();

    // Bind tags as Option<&[String]> for TEXT[] update
    let tags_bind: Option<&[String]> = note.tags.as_ref().map(|v| v.as_slice());

    let res = sqlx::query!(
        r#"
        UPDATE notes
        SET title = $1, body = $2, revision = $3, tags = $4, updated_at = $5
        WHERE id = $6
        "#,
        note.title,
        note.body,
        note.revision,
        tags_bind,
        note.updated_at,
        note.id
    )
    .execute(&pool)
    .await;

    match res {
        Ok(_) => {
            // Ensure API returns Some(vec) consistently
            note.tags = Some(note.tags.unwrap_or_default());
            (StatusCode::OK, AxumJson(note)).into_response()
        }
        Err(e) => {
            tracing::error!("Update note DB error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Failed to update note"})),
            )
                .into_response()
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
        Ok(_) => (StatusCode::NO_CONTENT, AxumJson(json!({}))).into_response(),
        Err(e) => {
            tracing::error!("Delete note error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({"error":"Failed to delete note"})),
            )
                .into_response()
        }
    }
}
