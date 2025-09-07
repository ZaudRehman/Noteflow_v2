use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Represents a user in the system. (Password not included)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    /// Unique identifier for the user
    pub id: Uuid,
    pub username: String,
}

/// Represents a note created by a user.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    /// Unique identifier of the note
    pub id: Uuid,
    /// Reference to the user who owns the note
    pub user_id: Uuid,
    /// Title or headline of the note
    pub title: String,
    /// Main content body of the note
    pub body: String,
    /// Revision count to track versions or updates
    pub revision: i64,
    /// Tags associated with the note for categorization
    pub tags: Vec<String>,
    /// Timestamp when the note was created
    pub created_at: DateTime<Utc>,
    /// Timestamp of last update to the note
    pub updated_at: DateTime<Utc>,
}

/// Represents a single revision/version of a note (body only - for viewing history and reverting changes).
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Revision {
    /// Unique identifier for the revision
    pub id: Uuid,
    /// The note this revision belongs to
    pub note_id: Uuid,
    /// Version number or revision count
    pub revision_number: i64,
    /// Content snapshot for this revision
    pub body: String,
    /// Timestamp when this revision was created
    pub created_at: DateTime<Utc>,
}

/// JWT Claims struct for authentication tokens.
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject: user ID the token refers to
    pub sub: Uuid,
    /// Username of the authenticated user
    pub username: String,
    /// Expiration timestamp for token validity
    pub exp: i64,
}
