use crate::models::Claims;
use anyhow::{Context, Result};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use std::env;

/// Hash a plaintext password using bcrypt with the default cost.
/// Returns the hash string.
pub fn hash_password(password: &str) -> Result<String> {
    // DEFAULT_COST is currently 12 in bcrypt crate; adjust via env if needed.
    let hashed = hash(password, DEFAULT_COST).context("Failed to hash the password")?;
    Ok(hashed)
}

/// Verify a plaintext password against a bcrypt hash.
/// Returns true if the password matches.
pub fn verify_password(password: &str, hash_str: &str) -> Result<bool> {
    let valid = verify(password, hash_str).context("Failed to verify the password")?;
    Ok(valid)
}

/// Encode a JWT from Claims using HMAC secret from env var JWT_SECRET.
/// Uses Header::default() (HS256) and returns the token string.
pub fn encode_jwt(claims: &Claims) -> Result<String> {
    let secret = env::var("JWT_SECRET").context("JWT_SECRET environment variable is not set")?;
    let token = encode(
        &Header::default(),
        claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .context("Failed to encode JWT token")?;
    Ok(token)
}

/// Decode a JWT string into Claims using HMAC secret from env var JWT_SECRET.
/// Uses Validation::default() (validates exp by default).
pub fn decode_jwt(token: &str) -> Result<Claims> {
    let secret = env::var("JWT_SECRET").context("JWT_SECRET environment variable is not set")?;
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .context("Failed to decode JWT token")?;
    Ok(token_data.claims)
}
