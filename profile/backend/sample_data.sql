-- ============================================================
--  SAMPLE DATA — Run this AFTER campus_skill_exchange.sql
--  Seeds a real user matching the original dummy data
-- ============================================================

USE campus_skill_exchange;

-- ── 1. Insert sample user (Aanya Sharma) ──
-- Password: student123 (replace hash with real one from PHP)
INSERT INTO users (name, email, password, bio, experience_level, avg_rating, total_reviews)
VALUES (
    'Aanya Sharma',
    'aanya.sharma@university.edu',
    '$2y$10$examplehashreplacewithrealphphash',
    'Passionate design-focused developer blending aesthetics with functionality. I love collaborating on student projects that solve real campus problems. Currently exploring design systems and accessibility.',
    'Intermediate',
    4.50,
    3
);

SET @user_id = LAST_INSERT_ID();

-- ── 2. Assign skills to Aanya ──
-- Skills already seeded: React=6, PHP=4, MySQL=5, Python=9, Figma=11
INSERT INTO user_skills (user_id, skill_id)
SELECT @user_id, id FROM skills
WHERE name IN ('React', 'PHP', 'MySQL', 'Python', 'Figma', 'CSS', 'Node.js');

-- ── 3. Insert projects posted by Aanya ──
INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
VALUES
(
    'Campus Event Finder',
    'A web app to help students discover and RSVP to campus events.',
    1, -- Web Development
    @user_id,
    'Intermediate',
    'open'
),
(
    'Study Group Matcher',
    'Match students with similar subjects into study groups automatically.',
    3, -- UI/UX Design
    @user_id,
    'Beginner',
    'in_progress'
),
(
    'Library Seat Booking',
    'Reserve library seats and study rooms online in advance.',
    1, -- Web Development
    @user_id,
    'Intermediate',
    'completed'
);

-- Save posted project IDs
SET @proj1 = LAST_INSERT_ID() - 2;
SET @proj2 = LAST_INSERT_ID() - 1;
SET @proj3 = LAST_INSERT_ID();

-- ── 4. Add Aanya as member of completed project ──
INSERT INTO project_members (project_id, user_id)
VALUES (@proj3, @user_id);

-- ── 5. Insert 2 other users (reviewers) ──
INSERT INTO users (name, email, password, experience_level)
VALUES
('Ravi Mehta',  'ravi@university.edu',  '$2y$10$placeholder', 'Advanced'),
('Priya Nair',  'priya@university.edu', '$2y$10$placeholder', 'Intermediate'),
('Arjun Das',   'arjun@university.edu', '$2y$10$placeholder', 'Beginner');

SET @ravi_id  = LAST_INSERT_ID() - 2;
SET @priya_id = LAST_INSERT_ID() - 1;
SET @arjun_id = LAST_INSERT_ID();

-- ── 6. Applications by Aanya on other projects ──
-- Create 2 projects by other users first
INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
VALUES
(
    'AI Tutor Bot',
    'Build an AI-powered tutoring assistant for students.',
    2,         -- Machine Learning
    @ravi_id,
    'Advanced',
    'in_progress'
),
(
    'Campus Nav App',
    'Mobile app for navigating the campus with AR features.',
    4,         -- Mobile Development
    @priya_id,
    'Intermediate',
    'open'
);

SET @ai_proj   = LAST_INSERT_ID() - 1;
SET @nav_proj  = LAST_INSERT_ID();

-- Aanya applies to both
INSERT INTO project_applications (project_id, applicant_id, status, message)
VALUES
(@ai_proj,  @user_id, 'pending', 'I have Python and ML experience and would love to contribute!'),
(@nav_proj, @user_id, 'pending', 'I can handle the UI/UX and React Native parts.');

-- ── 7. Ratings/Reviews received by Aanya ──
INSERT INTO ratings (project_id, giver_id, receiver_id, rating, feedback)
VALUES
(
    @proj3,
    @ravi_id,
    @user_id,
    5,
    'Aanya delivered exceptional UI work. Very responsive and detail-oriented. Would definitely collaborate again!'
),
(
    @proj3,
    @priya_id,
    @user_id,
    4,
    'Great collaboration on the library project. She brought creative ideas and shipped on time.'
),
(
    @proj2,
    @arjun_id,
    @user_id,
    5,
    'Super talented designer. Her Figma prototypes saved us weeks of back-and-forth.'
);

-- ── 8. Notifications for Aanya ──
INSERT INTO notifications (user_id, message)
VALUES
(@user_id, 'Your application to "AI Tutor Bot" is under review.'),
(@user_id, 'You received a new 5-star rating from Ravi Mehta!'),
(@user_id, '"Library Seat Booking" has been marked as Completed.');

-- ============================================================
-- Done! Now test: http://localhost/backend/api/profile.php?user_id=1
-- (adjust user_id based on your actual first inserted user id)
-- ============================================================