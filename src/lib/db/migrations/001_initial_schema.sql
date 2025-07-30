-- Migration 001: Initial FutureSync Database Schema
-- Created: 2024-07-30
-- Description: Creates all initial tables, indexes, and constraints for FutureSync production database

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'enterprise_admin');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE vision_category AS ENUM ('health', 'career', 'relationships', 'personal-growth');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
CREATE TYPE time_complexity AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_type AS ENUM ('daily_reminder', 'achievement', 'streak_milestone', 'team_update');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'export_data', 'delete_account');

-- Users table - core user data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    onboarding_completed BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- OAuth providers table
CREATE TABLE user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider, provider_user_id)
);

-- Organizations table for enterprise features
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    subscription_plan subscription_plan DEFAULT 'enterprise',
    subscription_status subscription_status DEFAULT 'trial',
    max_members INTEGER DEFAULT 50,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization memberships
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    
    UNIQUE(organization_id, user_id)
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'trial',
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP,
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visions table
CREATE TABLE visions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category vision_category NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    time_allocation_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI analysis data for visions
CREATE TABLE vision_ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vision_id UUID NOT NULL REFERENCES visions(id) ON DELETE CASCADE,
    themes TEXT[] DEFAULT '{}',
    key_goals TEXT[] DEFAULT '{}',
    suggested_actions TEXT[] DEFAULT '{}',
    time_complexity time_complexity DEFAULT 'medium',
    feasibility_score DECIMAL(3,2) DEFAULT 0.8,
    improvements TEXT[] DEFAULT '{}',
    analysis_version VARCHAR(10) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily actions table
CREATE TABLE daily_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vision_id UUID NOT NULL REFERENCES visions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    estimated_time_minutes INTEGER NOT NULL DEFAULT 30,
    actual_time_minutes INTEGER,
    status action_status DEFAULT 'pending',
    date DATE NOT NULL,
    ai_generated BOOLEAN DEFAULT true,
    ai_reasoning TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action timing sessions
CREATE TABLE action_timing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES daily_actions(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time budget allocations
CREATE TABLE time_budget_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_available_minutes INTEGER NOT NULL DEFAULT 480,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, date)
);

-- Individual vision allocations for a day
CREATE TABLE vision_time_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_allocation_id UUID NOT NULL REFERENCES time_budget_allocations(id) ON DELETE CASCADE,
    vision_id UUID NOT NULL REFERENCES visions(id) ON DELETE CASCADE,
    allocated_minutes INTEGER NOT NULL DEFAULT 0,
    
    UNIQUE(budget_allocation_id, vision_id)
);

-- User progress and streaks
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_days_completed INTEGER DEFAULT 0,
    total_actions_completed INTEGER DEFAULT 0,
    total_time_invested_minutes INTEGER DEFAULT 0,
    last_completion_date DATE,
    streak_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Victory posts for community feature
CREATE TABLE victory_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    goal_description TEXT,
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Victory post interactions
CREATE TABLE victory_post_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES victory_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL,
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, user_id, interaction_type)
);

-- Achievements system
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    background_color VARCHAR(7) DEFAULT '#3B82F6',
    criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_id)
);

-- Notifications
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_reminders BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    streak_milestones BOOLEAN DEFAULT true,
    team_updates BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    notification_time TIME DEFAULT '09:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Analytics events (partitioned table)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID,
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB DEFAULT '{}',
    user_properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- Create initial analytics partition
CREATE TABLE analytics_events_2024 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Audit log (partitioned table)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- Create initial audit log partition
CREATE TABLE audit_log_2024 PARTITION OF audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Data export requests
CREATE TABLE data_export_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    export_url TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

CREATE INDEX idx_oauth_user_id ON user_oauth_providers(user_id);
CREATE INDEX idx_oauth_provider_user ON user_oauth_providers(provider, provider_user_id);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_domain ON organizations(domain) WHERE domain IS NOT NULL;

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON user_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);

CREATE INDEX idx_visions_user_active ON visions(user_id, is_active);
CREATE INDEX idx_visions_category ON visions(category);
CREATE INDEX idx_visions_priority ON visions(user_id, priority);

CREATE INDEX idx_vision_ai_vision ON vision_ai_analysis(vision_id);

CREATE INDEX idx_actions_user_date ON daily_actions(user_id, date);
CREATE INDEX idx_actions_vision ON daily_actions(vision_id);
CREATE INDEX idx_actions_status ON daily_actions(status);
CREATE INDEX idx_actions_date ON daily_actions(date);

CREATE INDEX idx_timing_action ON action_timing_sessions(action_id);
CREATE INDEX idx_timing_active ON action_timing_sessions(is_active) WHERE is_active = true;

CREATE INDEX idx_budget_user_date ON time_budget_allocations(user_id, date);
CREATE INDEX idx_vision_allocations_budget ON vision_time_allocations(budget_allocation_id);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_streak ON user_progress(current_streak DESC);

CREATE INDEX idx_victory_user ON victory_posts(user_id);
CREATE INDEX idx_victory_public_created ON victory_posts(is_public, created_at DESC) WHERE is_public = true;

CREATE INDEX idx_victory_interactions_post ON victory_post_interactions(post_id);
CREATE INDEX idx_victory_interactions_user ON victory_post_interactions(user_id);

CREATE INDEX idx_achievements_key ON achievements(key) WHERE is_active = true;
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

CREATE INDEX idx_notifications_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON user_notifications(type);

CREATE INDEX idx_analytics_user_timestamp ON analytics_events(user_id, timestamp);
CREATE INDEX idx_analytics_event_timestamp ON analytics_events(event_name, timestamp);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);

CREATE INDEX idx_audit_user_timestamp ON audit_log(user_id, timestamp);
CREATE INDEX idx_audit_action_timestamp ON audit_log(action, timestamp);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);

CREATE INDEX idx_data_export_user_status ON data_export_requests(user_id, status);

-- Full-text search indexes
CREATE INDEX idx_visions_description_fts ON visions USING gin(to_tsvector('english', description));
CREATE INDEX idx_actions_description_fts ON daily_actions USING gin(to_tsvector('english', description));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_updated_at BEFORE UPDATE ON user_oauth_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visions_updated_at BEFORE UPDATE ON visions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vision_ai_updated_at BEFORE UPDATE ON vision_ai_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON daily_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_updated_at BEFORE UPDATE ON time_budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_victory_updated_at BEFORE UPDATE ON victory_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on appropriate tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_timing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_time_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create a migration record table to track applied migrations
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');

COMMIT;