-- migrations/0003_create_revisions.sql

CREATE TABLE IF NOT EXISTS revisions (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    revision_number BIGINT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_note_id ON revisions(note_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_revisions_note_revision ON revisions(note_id, revision_number);
