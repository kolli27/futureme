-- Auth Tokens Migration
-- Add authentication tokens table for email verification, password reset, etc.

-- Create auth_tokens table
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset', 'login_verification')),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_user_type ON auth_tokens(user_id, type);
CREATE INDEX idx_auth_tokens_expires ON auth_tokens(expires_at);
CREATE INDEX idx_auth_tokens_cleanup ON auth_tokens(expires_at) WHERE used_at IS NULL;

-- Add trigger for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() 
RETURNS void AS $$
BEGIN
    DELETE FROM auth_tokens 
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE auth_tokens IS 'Authentication tokens for email verification, password reset, and other auth flows';
COMMENT ON COLUMN auth_tokens.type IS 'Type of token: email_verification, password_reset, login_verification';
COMMENT ON COLUMN auth_tokens.expires_at IS 'When the token expires and becomes invalid';
COMMENT ON COLUMN auth_tokens.used_at IS 'When the token was used (null if unused)';

-- Optional: Create a scheduled job to clean up old tokens (PostgreSQL specific)
-- This would typically be set up outside of the migration in a cron job or similar
-- SELECT cron.schedule('cleanup-auth-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens();');