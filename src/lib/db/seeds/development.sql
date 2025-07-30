-- Development Seed Data for FutureSync
-- This file creates realistic test data for development and testing

BEGIN;

-- Insert test users
INSERT INTO users (id, email, name, display_name, avatar_url, onboarding_completed, created_at) VALUES
('user_demo_1', 'demo@futurasync.com', 'Demo User', 'Demo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
('user_demo_2', 'sarah@example.com', 'Sarah Johnson', 'Sarah', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', true, CURRENT_TIMESTAMP - INTERVAL '15 days'),
('user_demo_3', 'alex@example.com', 'Alex Chen', 'Alex', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', true, CURRENT_TIMESTAMP - INTERVAL '7 days'),
('user_demo_4', 'emma@example.com', 'Emma Davis', 'Emma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', false, CURRENT_TIMESTAMP - INTERVAL '3 days'),
('user_demo_5', 'mike@example.com', 'Mike Wilson', 'Mike', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', true, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert user progress for demo users
INSERT INTO user_progress (user_id, current_streak, longest_streak, total_days_completed, total_actions_completed, total_time_invested_minutes, last_completion_date) VALUES
('user_demo_1', 5, 12, 25, 150, 3750, CURRENT_DATE - INTERVAL '1 day'),
('user_demo_2', 3, 8, 12, 72, 1800, CURRENT_DATE),
('user_demo_3', 2, 3, 5, 30, 750, CURRENT_DATE),
('user_demo_4', 0, 0, 0, 0, 0, NULL),
('user_demo_5', 1, 1, 1, 6, 150, CURRENT_DATE);

-- Insert user subscriptions
INSERT INTO user_subscriptions (user_id, plan, status, trial_ends_at) VALUES
('user_demo_1', 'pro', 'active', CURRENT_TIMESTAMP + INTERVAL '30 days'),
('user_demo_2', 'free', 'active', NULL),
('user_demo_3', 'free', 'trial', CURRENT_TIMESTAMP + INTERVAL '7 days'),
('user_demo_4', 'free', 'trial', CURRENT_TIMESTAMP + INTERVAL '14 days'),
('user_demo_5', 'free', 'trial', CURRENT_TIMESTAMP + INTERVAL '13 days');

-- Insert notification preferences
INSERT INTO user_notification_preferences (user_id, notification_time, timezone) VALUES
('user_demo_1', '08:00:00', 'America/New_York'),
('user_demo_2', '09:00:00', 'America/Los_Angeles'),
('user_demo_3', '07:30:00', 'UTC'),
('user_demo_4', '09:00:00', 'Europe/London'),
('user_demo_5', '10:00:00', 'Asia/Tokyo');

-- Insert demo visions for each user
INSERT INTO visions (id, user_id, category, title, description, priority, time_allocation_minutes) VALUES
-- Demo User 1 visions
('vision_demo_1_health', 'user_demo_1', 'health', 'Marathon Runner', 'Train consistently to complete my first marathon within the next year, building endurance and maintaining injury-free training.', 1, 60),
('vision_demo_1_career', 'user_demo_1', 'career', 'Senior Engineer', 'Advance to a senior software engineering position by mastering system design, leading projects, and mentoring junior developers.', 2, 45),
('vision_demo_1_personal', 'user_demo_1', 'personal-growth', 'Mindfulness Master', 'Develop a consistent meditation practice and emotional intelligence to reduce stress and improve relationships.', 3, 30),

-- Sarah visions
('vision_demo_2_career', 'user_demo_2', 'career', 'Design Leadership', 'Transition into a UX design leadership role, building team management skills and strategic design thinking.', 1, 50),
('vision_demo_2_health', 'user_demo_2', 'health', 'Wellness Advocate', 'Create sustainable healthy habits including regular exercise, nutritious eating, and work-life balance.', 2, 40),
('vision_demo_2_relations', 'user_demo_2', 'relationships', 'Community Builder', 'Build deeper friendships and professional networks through active community involvement and authentic connections.', 3, 25),

-- Alex visions
('vision_demo_3_personal', 'user_demo_3', 'personal-growth', 'Creative Entrepreneur', 'Launch a creative side business combining my artistic skills with business acumen to generate passive income.', 1, 60),
('vision_demo_3_health', 'user_demo_3', 'health', 'Strength Builder', 'Build physical and mental strength through consistent weightlifting and challenging myself with new goals.', 2, 45),

-- Emma visions (new user, fewer visions)
('vision_demo_4_career', 'user_demo_4', 'career', 'Marketing Expert', 'Develop comprehensive marketing skills and establish myself as a go-to expert in digital marketing strategies.', 1, 40),

-- Mike visions
('vision_demo_5_relations', 'user_demo_5', 'relationships', 'Family First', 'Strengthen family relationships and create lasting memories while balancing work and personal commitments.', 1, 35),
('vision_demo_5_health', 'user_demo_5', 'health', 'Active Lifestyle', 'Maintain an active lifestyle through sports, hiking, and outdoor activities that bring joy and health.', 2, 40);

-- Insert AI analysis for visions
INSERT INTO vision_ai_analysis (vision_id, themes, key_goals, suggested_actions, time_complexity, feasibility_score, improvements) VALUES
('vision_demo_1_health', 
 ARRAY['endurance training', 'injury prevention', 'athletic performance'], 
 ARRAY['Complete a marathon', 'Build running base', 'Prevent injuries'], 
 ARRAY['Daily run or cross-training', 'Weekly long run', 'Strength training'], 
 'high', 0.85, 
 ARRAY['Create detailed training plan', 'Track weekly mileage', 'Include rest days']),

('vision_demo_1_career', 
 ARRAY['technical leadership', 'system design', 'mentorship'], 
 ARRAY['Lead major project', 'Master system architecture', 'Mentor team members'], 
 ARRAY['Study system design patterns', 'Take on leadership tasks', 'Schedule mentoring sessions'], 
 'medium', 0.90, 
 ARRAY['Seek feedback from seniors', 'Document learning progress', 'Build portfolio']),

('vision_demo_2_career', 
 ARRAY['design leadership', 'team management', 'strategic thinking'], 
 ARRAY['Lead design team', 'Influence product strategy', 'Develop others'], 
 ARRAY['Study leadership principles', 'Practice team facilitation', 'Build design systems'], 
 'medium', 0.80, 
 ARRAY['Get leadership training', 'Find mentorship', 'Practice public speaking']),

('vision_demo_3_personal', 
 ARRAY['entrepreneurship', 'creativity', 'business development'], 
 ARRAY['Launch profitable business', 'Develop creative skills', 'Build customer base'], 
 ARRAY['Research market opportunities', 'Create business plan', 'Develop MVP'], 
 'high', 0.70, 
 ARRAY['Validate idea early', 'Set realistic timeline', 'Build network']);

-- Insert daily actions for the past few days
INSERT INTO daily_actions (id, user_id, vision_id, description, estimated_time_minutes, actual_time_minutes, status, date, ai_generated, ai_reasoning, completed_at) VALUES
-- Demo User 1 - Yesterday (completed day)
('action_demo_1_1', 'user_demo_1', 'vision_demo_1_health', 'Complete 5-mile training run at easy pace', 45, 50, 'completed', CURRENT_DATE - INTERVAL '1 day', true, 'Building aerobic base for marathon training', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '8 hours'),
('action_demo_1_2', 'user_demo_1', 'vision_demo_1_career', 'Review system design patterns for microservices', 30, 35, 'completed', CURRENT_DATE - INTERVAL '1 day', true, 'Essential knowledge for senior engineering role', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '14 hours'),
('action_demo_1_3', 'user_demo_1', 'vision_demo_1_personal', 'Practice 20-minute guided meditation', 20, 22, 'completed', CURRENT_DATE - INTERVAL '1 day', true, 'Developing consistent mindfulness practice', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '19 hours'),

-- Demo User 1 - Today (in progress)
('action_demo_1_4', 'user_demo_1', 'vision_demo_1_health', 'Cross-training: 30 minutes cycling or swimming', 40, NULL, 'pending', CURRENT_DATE, true, 'Active recovery while building cardiovascular fitness', NULL),
('action_demo_1_5', 'user_demo_1', 'vision_demo_1_career', 'Code review session with junior developer', 25, NULL, 'pending', CURRENT_DATE, true, 'Practice mentoring skills for leadership growth', NULL),

-- Sarah - Today
('action_demo_2_1', 'user_demo_2', 'vision_demo_2_career', 'Research design leadership methodologies', 35, 40, 'completed', CURRENT_DATE, true, 'Understanding different approaches to design leadership', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('action_demo_2_2', 'user_demo_2', 'vision_demo_2_health', 'Take a 30-minute walk during lunch break', 30, NULL, 'pending', CURRENT_DATE, true, 'Building consistent movement into daily routine', NULL),
('action_demo_2_3', 'user_demo_2', 'vision_demo_2_relations', 'Reach out to 2 colleagues for informal coffee chat', 15, NULL, 'pending', CURRENT_DATE, true, 'Strengthening professional relationships through personal connection', NULL),

-- Alex - Today
('action_demo_3_1', 'user_demo_3', 'vision_demo_3_personal', 'Sketch 3 product concepts for side business', 45, NULL, 'in_progress', CURRENT_DATE, true, 'Exploring creative directions for entrepreneurial venture', NULL),
('action_demo_3_2', 'user_demo_3', 'vision_demo_3_health', 'Complete upper body strength training session', 40, NULL, 'pending', CURRENT_DATE, true, 'Building functional strength and muscle development', NULL),

-- Mike - Today (first day)
('action_demo_5_1', 'user_demo_5', 'vision_demo_5_relations', 'Plan weekend family activity or outing', 20, 25, 'completed', CURRENT_DATE, true, 'Creating opportunities for quality family time', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('action_demo_5_2', 'user_demo_5', 'vision_demo_5_health', 'Go for 45-minute nature hike or bike ride', 45, NULL, 'pending', CURRENT_DATE, true, 'Combining physical activity with outdoor enjoyment', NULL);

-- Insert time budget allocations
INSERT INTO time_budget_allocations (user_id, date, total_available_minutes) VALUES
('user_demo_1', CURRENT_DATE - INTERVAL '1 day', 180),
('user_demo_1', CURRENT_DATE, 150),
('user_demo_2', CURRENT_DATE, 120),
('user_demo_3', CURRENT_DATE, 90),
('user_demo_5', CURRENT_DATE, 75);

-- Insert vision time allocations
INSERT INTO vision_time_allocations (budget_allocation_id, vision_id, allocated_minutes) VALUES
-- Demo User 1 - Yesterday
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE - INTERVAL '1 day'), 'vision_demo_1_health', 60),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE - INTERVAL '1 day'), 'vision_demo_1_career', 80),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE - INTERVAL '1 day'), 'vision_demo_1_personal', 40),

-- Demo User 1 - Today
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE), 'vision_demo_1_health', 50),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE), 'vision_demo_1_career', 60),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_1' AND date = CURRENT_DATE), 'vision_demo_1_personal', 40),

-- Sarah - Today
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_2' AND date = CURRENT_DATE), 'vision_demo_2_career', 50),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_2' AND date = CURRENT_DATE), 'vision_demo_2_health', 40),
((SELECT id FROM time_budget_allocations WHERE user_id = 'user_demo_2' AND date = CURRENT_DATE), 'vision_demo_2_relations', 30);

-- Insert action timing sessions
INSERT INTO action_timing_sessions (action_id, started_at, ended_at, duration_seconds, is_active) VALUES
('action_demo_1_1', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '8 hours 50 minutes', 3000, false),
('action_demo_1_2', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '14 hours', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '14 hours 35 minutes', 2100, false),
('action_demo_1_3', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '19 hours', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '19 hours 22 minutes', 1320, false),
('action_demo_2_1', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 20 minutes', 2400, false),
('action_demo_5_1', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours 35 minutes', 1500, false);

-- Insert some victory posts
INSERT INTO victory_posts (user_id, content, day_number, goal_description, likes_count, comments_count) VALUES
('user_demo_1', 'Completed my longest training run yet - 12 miles! My legs are tired but my spirit is soaring. Each step brings me closer to my marathon goal. 🏃‍♂️💪', 25, 'Marathon training consistency', 8, 3),
('user_demo_2', 'Had the most productive design critique session today. Really feeling like my leadership skills are developing. The team was so engaged and collaborative! ✨', 12, 'Developing design leadership', 5, 2),
('user_demo_3', 'Sketched out 5 different product concepts today. One of them really clicked - I think I found my side business idea! Time to start validating. 🎨🚀', 5, 'Creative entrepreneurship journey', 3, 1);

-- Insert victory post interactions
INSERT INTO victory_post_interactions (post_id, user_id, interaction_type, comment_text) VALUES
((SELECT id FROM victory_posts WHERE user_id = 'user_demo_1' LIMIT 1), 'user_demo_2', 'like', NULL),
((SELECT id FROM victory_posts WHERE user_id = 'user_demo_1' LIMIT 1), 'user_demo_3', 'like', NULL),
((SELECT id FROM victory_posts WHERE user_id = 'user_demo_1' LIMIT 1), 'user_demo_2', 'comment', 'Amazing progress! You''re going to crush that marathon 🔥'),
((SELECT id FROM victory_posts WHERE user_id = 'user_demo_2' LIMIT 1), 'user_demo_1', 'like', NULL),
((SELECT id FROM victory_posts WHERE user_id = 'user_demo_2' LIMIT 1), 'user_demo_3', 'comment', 'Love seeing your leadership growth! Keep inspiring the team 💫');

-- Insert user achievements
INSERT INTO user_achievements (user_id, achievement_id) VALUES
('user_demo_1', (SELECT id FROM achievements WHERE key = 'first_day')),
('user_demo_1', (SELECT id FROM achievements WHERE key = 'week_warrior')),
('user_demo_1', (SELECT id FROM achievements WHERE key = 'vision_creator')),
('user_demo_1', (SELECT id FROM achievements WHERE key = 'action_hero')),
('user_demo_2', (SELECT id FROM achievements WHERE key = 'first_day')),
('user_demo_2', (SELECT id FROM achievements WHERE key = 'vision_creator')),
('user_demo_3', (SELECT id FROM achievements WHERE key = 'first_day')),
('user_demo_3', (SELECT id FROM achievements WHERE key = 'vision_creator')),
('user_demo_5', (SELECT id FROM achievements WHERE key = 'first_day')),
('user_demo_5', (SELECT id FROM achievements WHERE key = 'vision_creator'));

-- Insert some notifications
INSERT INTO user_notifications (user_id, type, title, content, data, is_read) VALUES
('user_demo_1', 'achievement', 'New Achievement Unlocked!', 'Congratulations! You''ve earned the "Week Warrior" achievement for completing 7 consecutive days.', '{"achievement_key": "week_warrior"}', false),
('user_demo_1', 'daily_reminder', 'Your Daily Actions Await', 'Good morning! You have 2 actions planned for today. Let''s make it another great day of progress.', '{"actions_count": 2}', true),
('user_demo_2', 'streak_milestone', 'You''re on Fire!', 'Congratulations on your 3-day streak! Keep the momentum going.', '{"streak": 3}', false),
('user_demo_3', 'daily_reminder', 'Time to Take Action', 'Your creative entrepreneurship journey continues today. You have 2 actions ready to go!', '{"actions_count": 2}', true),
('user_demo_5', 'achievement', 'Welcome to FutureSync!', 'You''ve earned your first achievement! Welcome to your transformation journey.', '{"achievement_key": "first_day"}', false);

-- Insert sample analytics events
INSERT INTO analytics_events (user_id, session_id, event_name, event_properties, user_properties) VALUES
('user_demo_1', uuid_generate_v4(), 'action_completed', '{"action_id": "action_demo_1_1", "category": "health", "duration_seconds": 3000}', '{"plan": "pro", "streak": 5}'),
('user_demo_1', uuid_generate_v4(), 'page_view', '{"page": "/dashboard", "source": "direct"}', '{"plan": "pro", "streak": 5}'),
('user_demo_2', uuid_generate_v4(), 'action_completed', '{"action_id": "action_demo_2_1", "category": "career", "duration_seconds": 2400}', '{"plan": "free", "streak": 3}'),
('user_demo_2', uuid_generate_v4(), 'vision_created', '{"category": "career", "time_allocation": 50}', '{"plan": "free", "streak": 3}'),
('user_demo_3', uuid_generate_v4(), 'timer_started', '{"action_id": "action_demo_3_1"}', '{"plan": "free", "streak": 2}'),
('user_demo_5', uuid_generate_v4(), 'onboarding_completed', '{"visions_created": 2, "time_spent_seconds": 900}', '{"plan": "free", "is_new": true}');

-- Insert audit log entries
INSERT INTO audit_log (user_id, action, resource_type, resource_id, new_values, ip_address, user_agent) VALUES
('user_demo_1', 'login', 'user', 'user_demo_1', '{"last_login": "2024-07-30T08:00:00Z"}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
('user_demo_2', 'create', 'vision', 'vision_demo_2_career', '{"category": "career", "title": "Design Leadership"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
('user_demo_3', 'update', 'action', 'action_demo_3_1', '{"status": "in_progress"}', '192.168.1.102', 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)'),
('user_demo_5', 'create', 'user', 'user_demo_5', '{"email": "mike@example.com", "name": "Mike Wilson"}', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');

COMMIT;

-- Create view for easy demo data access
CREATE OR REPLACE VIEW demo_user_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.onboarding_completed,
    p.current_streak,
    p.total_days_completed,
    p.total_actions_completed,
    COUNT(v.id) as visions_count,
    COUNT(CASE WHEN da.date = CURRENT_DATE THEN 1 END) as todays_actions,
    COUNT(CASE WHEN da.status = 'completed' AND da.date = CURRENT_DATE THEN 1 END) as todays_completed
FROM users u
LEFT JOIN user_progress p ON u.id = p.user_id
LEFT JOIN visions v ON u.id = v.user_id AND v.is_active = true
LEFT JOIN daily_actions da ON u.id = da.user_id
WHERE u.id LIKE 'user_demo_%'
GROUP BY u.id, u.name, u.email, u.onboarding_completed, p.current_streak, p.total_days_completed, p.total_actions_completed
ORDER BY u.created_at;

-- Show summary
SELECT 'Demo Data Summary' as info;
SELECT * FROM demo_user_summary;