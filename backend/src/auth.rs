// src/auth.rs
use axum::{
    extract::{Extension, Json},
    http::StatusCode,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;
use crate::{models::{Claims}, utils};
use anyhow::Context;

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
    // Hash the password using the utils helper
    let hashed = match utils::hash_password(&payload.password) {
        Ok(h) => h,
        Err(err) => {
            tracing::error!("Password hashing error: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password");
        }
    };

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
        Ok(_) => (StatusCode::CREATED, "User created successfully"),
        Err(e) => {
            tracing::error!("DB insert user error: {:?}", e);
            if e.to_string().contains("duplicate key") {
                (StatusCode::CONFLICT, "Username already exists")
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user")
            }
        }
    }
}

pub async fn login(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let row = sqlx::query!(
        "SELECT id, username, password_hash FROM users WHERE username = $1",
        payload.username
    )
    .fetch_optional(&pool)
    .await;

    let user = match row {
        Ok(Some(user)) => user,
        Ok(None) => return (StatusCode::UNAUTHORIZED, "Invalid username or password"),
        Err(e) => {
            tracing::error!("DB query error: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Login failed");
        }
    };

    // Verify password using utils helper
    let valid_password = match utils::verify_password(&payload.password, &user.password_hash) {
        Ok(valid) => valid,
        Err(err) => {
            tracing::error!("Password verification error: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Login failed");
        }
    };

    if !valid_password {
        return (StatusCode::UNAUTHORIZED, "Invalid username or password");
    }

    // Create JWT claims
    let expiration = Utc::now().timestamp() + 60 * 60 * 24;
    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        exp: expiration,
    };

    // Encode JWT token via utils
    let token = match utils::encode_jwt(&claims) {
        Ok(t) => t,
        Err(err) => {
            tracing::error!("JWT encode error: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to generate token");
        }
    };

    (StatusCode::OK, serde_json::json!({ "token": token }))
}
