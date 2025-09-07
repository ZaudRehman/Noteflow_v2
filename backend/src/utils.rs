use bcrypt::{hash, verify, DEFAULT_COST};
use anyhow::{Result, Context};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use std::env;
use crate::models::Claims;

/// Hashes a plaintext password using bcrypt with default cost.
/// Returns the hashed password as a String, or error.
pub fn hash_password(password: &str) -> Result<String> {
    let hashed = hash(password, DEFAULT_COST)
        .context("Failed to hash the password")?;
    Ok(hashed)
}

/// Verifies a plaintext password against a bcrypt hash.
/// Returns true if the password matches, false otherwise.
pub fn verify_password(password: &str, hash: &str) -> Result<bool> {
    let valid = verify(password, hash)
        .context("Failed to verify the password")?;
    Ok(valid)
}

/// Encodes JWT token from Claims using secret from environment.
/// Returns the JWT token string or error.
pub fn encode_jwt(claims: &Claims) -> Result<String> {
    let secret = env::var("JWT_SECRET")
        .context("JWT_SECRET environment variable is not set")?;
    let token = encode(&Header::default(), claims, &EncodingKey::from_secret(secret.as_bytes()))
        .context("Failed to encode JWT token")?;
    Ok(token)
}

/// Decodes JWT token into Claims using secret from environment.
/// Returns the Claims struct or error.
pub fn decode_jwt(token: &str) -> Result<Claims> {
    let secret = env::var("JWT_SECRET")
        .context("JWT_SECRET environment variable is not set")?;
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    ).context("Failed to decode JWT token")?;
    Ok(token_data.claims)
}
