use crate::{models::Claims, utils};
use axum::{
    extract::{Extension, Json},
    http::StatusCode,
    response::IntoResponse,
    Json as AxumJson,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct SignupRequest {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
struct TokenResponse {
    pub token: String,
}

pub async fn signup(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<SignupRequest>,
) -> impl IntoResponse {
    // Hash password
    let hashed = match utils::hash_password(&payload.password) {
        Ok(h) => h,
        Err(err) => {
            tracing::error!("Password hashing error: {:?}", err);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(serde_json::json!({ "error": "Failed to hash password" })),
            )
                .into_response();
        }
    };

    // Create user
    let user_id = Uuid::new_v4();
    let res = sqlx::query!(
        "INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)",
        user_id,
        payload.username,
        hashed
    )
    .execute(&pool)
    .await;

    match res {
        Ok(_) => (
            StatusCode::CREATED,
            AxumJson(serde_json::json!({ "status": "ok" })),
        )
            .into_response(),
        Err(e) => {
            tracing::error!("DB insert user error: {:?}", e);
            if e.to_string().contains("duplicate key") {
                (
                    StatusCode::CONFLICT,
                    AxumJson(serde_json::json!({ "error": "Username already exists" })),
                )
                    .into_response()
            } else {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    AxumJson(serde_json::json!({ "error": "Failed to create user" })),
                )
                    .into_response()
            }
        }
    }
}

pub async fn login(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    // Fetch user by username
    let row = sqlx::query!(
        "SELECT id, username, password_hash FROM users WHERE username = $1",
        payload.username
    )
    .fetch_optional(&pool)
    .await;

    let user = match row {
        Ok(Some(user)) => user,
        Ok(None) => {
            return (
                StatusCode::UNAUTHORIZED,
                AxumJson(serde_json::json!({ "error": "Invalid username or password" })),
            )
                .into_response()
        }
        Err(e) => {
            tracing::error!("DB query error: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(serde_json::json!({ "error": "Login failed" })),
            )
                .into_response();
        }
    };

    // Verify password
    let valid_password = match utils::verify_password(&payload.password, &user.password_hash) {
        Ok(valid) => valid,
        Err(err) => {
            tracing::error!("Password verification error: {:?}", err);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(serde_json::json!({ "error": "Login failed" })),
            )
                .into_response();
        }
    };

    if !valid_password {
        return (
            StatusCode::UNAUTHORIZED,
            AxumJson(serde_json::json!({ "error": "Invalid username or password" })),
        )
            .into_response();
    }

    // Create JWT token
    let expiration = Utc::now().timestamp() + 60 * 60 * 24; // 1 day
    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        exp: expiration,
    };

    let token = match utils::encode_jwt(&claims) {
        Ok(t) => t,
        Err(err) => {
            tracing::error!("JWT encode error: {:?}", err);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(serde_json::json!({ "error": "Failed to generate token" })),
            )
                .into_response();
        }
    };

    (StatusCode::OK, AxumJson(TokenResponse { token })).into_response()
}
