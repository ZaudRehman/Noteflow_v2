use axum::response::{IntoResponse, Response};
use axum::http::StatusCode;
use thiserror::Error;
use serde_json::json;

/// Custom error type.
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Not Found")]
    NotFound,
    #[error("Bad Request: {0}")]
    BadRequest(String),
    #[error("Internal Server Error")]
    InternalServerError,
}

/// Type alias for Results using AppError
pub type AppResult<T> = Result<T, AppError>;

/// Converts AppError into HTTP Response with status code and JSON error message.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::NotFound => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::InternalServerError => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };

        let body = json!({
            "error": error_message,
        });

        (status, axum::Json(body)).into_response()
    }
}
