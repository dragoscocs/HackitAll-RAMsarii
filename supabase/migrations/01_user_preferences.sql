-- Migration script for Supabase: User AI Preferences
-- Adds the necessary configuration columns directly to the Users table.

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_persona_prompt TEXT,
ADD COLUMN IF NOT EXISTS user_health_limits TEXT;

-- Alternatively, if a separate 1-to-1 table is preferred for isolation:

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    user_persona_prompt TEXT,
    user_health_limits TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: The Java backend (Hibernate) uses `ddl-auto=update` and will natively add 
-- the text columns `user_persona_prompt` and `user_health_limits` directly to the `users` table
-- because they were added to the User.java JPA entity.
