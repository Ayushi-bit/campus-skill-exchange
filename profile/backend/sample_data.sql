-- ============================================================
--  CAMPUS SKILL EXCHANGE PLATFORM
--  Complete Database Setup Script (v2 — Final)
--  Includes all tables + improvements + sample data
--  Share this with teammates to sync DB structure
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_skill_exchange
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE campus_skill_exchange;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    name               VARCHAR(100) NOT NULL,
    email              VARCHAR(150) UNIQUE NOT NULL,
    password           VARCHAR(255) NOT NULL,
    bio                TEXT,
    profile_image      VARCHAR(255),
    experience_level   ENUM('Beginner','Intermediate','Advanced'),
    primary_domain_id  INT NULL,
    role               ENUM('student','admin') DEFAULT 'student',
    avg_rating         DECIMAL(3,2) DEFAULT 0.00,
    total_reviews      INT DEFAULT 0,
    github_url         VARCHAR(255),
    linkedin_url       VARCHAR(255),
    portfolio_url      VARCHAR(255),
    whatsapp_number    VARCHAR(20),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DOMAINS TABLE
-- ============================================================
CREATE TABLE domains (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. SKILLS TABLE
-- ============================================================
CREATE TABLE skills (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. USER_SKILLS TABLE (Many-to-Many: users <-> skills)
-- ============================================================
CREATE TABLE user_skills (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    skill_id   INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id)
);

-- ============================================================
-- 5. PROJECTS TABLE
-- ============================================================
CREATE TABLE projects (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(200) NOT NULL,
    description      TEXT NOT NULL,
    domain_id        INT NOT NULL,
    posted_by        INT NOT NULL,
    experience_level ENUM('Beginner','Intermediate','Advanced'),
    status           ENUM('open','in_progress','completed','closed') DEFAULT 'open',
    max_members      INT DEFAULT 1,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (domain_id) REFERENCES domains(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- ============================================================
-- 6. PROJECT_SKILLS TABLE (Skills required for a project)
-- ============================================================
CREATE TABLE project_skills (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    skill_id   INT NOT NULL,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id)   REFERENCES skills(id)   ON DELETE CASCADE,
    UNIQUE KEY unique_project_skill (project_id, skill_id)
);

-- ============================================================
-- 7. PROJECT_APPLICATIONS TABLE
-- ============================================================
CREATE TABLE project_applications (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    project_id   INT NOT NULL,
    applicant_id INT NOT NULL,
    status       ENUM('pending','accepted','rejected') DEFAULT 'pending',
    message      TEXT,
    applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)   REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id)    ON DELETE CASCADE,
    UNIQUE KEY unique_application (project_id, applicant_id)
);

-- ============================================================
-- 8. PROJECT_MEMBERS TABLE
-- ============================================================
CREATE TABLE project_members (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id    INT NOT NULL,
    role       ENUM('owner','member') DEFAULT 'member',
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    UNIQUE KEY unique_member (project_id, user_id)
);

-- ============================================================
-- 9. RATINGS TABLE
-- ============================================================
CREATE TABLE ratings (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    project_id  INT NOT NULL,
    giver_id    INT NOT NULL,
    receiver_id INT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback    TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (giver_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT unique_rating UNIQUE (project_id, giver_id, receiver_id)
);

-- ============================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    type       VARCHAR(50),
    message    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 11. PASSWORD_RESETS TABLE
-- ============================================================
CREATE TABLE password_resets (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ADD FOREIGN KEY: users.primary_domain_id → domains.id
-- (Added after domains table exists)
-- ============================================================
ALTER TABLE users
ADD CONSTRAINT fk_primary_domain
FOREIGN KEY (primary_domain_id) REFERENCES domains(id) ON DELETE SET NULL;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_projects_status     ON projects(status);
CREATE INDEX idx_projects_domain     ON projects(domain_id);
CREATE INDEX idx_applications_status ON project_applications(status);
CREATE INDEX idx_notifications_read  ON notifications(is_read);
CREATE INDEX idx_ratings_receiver    ON ratings(receiver_id);
CREATE INDEX idx_user_skills         ON user_skills(user_id);
CREATE INDEX idx_project_skills      ON project_skills(project_id);

-- ============================================================
-- SEED DATA: Domains
-- ============================================================
INSERT INTO domains (name) VALUES
    ('Web Development'),
    ('Machine Learning'),
    ('UI/UX Design'),
    ('Mobile Development'),
    ('Cybersecurity'),
    ('Data Science'),
    ('Game Development'),
    ('Cloud Computing');

-- ============================================================
-- SEED DATA: Skills
-- ============================================================
INSERT INTO skills (name) VALUES
    ('HTML'), ('CSS'), ('JavaScript'), ('PHP'), ('MySQL'),
    ('React'), ('Vue.js'), ('Node.js'), ('Python'), ('Java'),
    ('Figma'), ('Adobe XD'), ('Flutter'), ('Laravel'),
    ('Machine Learning'), ('TensorFlow'), ('Git'), ('Docker');

-- ============================================================
-- SEED DATA: Users
-- Note: Passwords are placeholder hashes
-- Generate real ones using: password_hash('yourpassword', PASSWORD_BCRYPT)
-- ============================================================
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@campus.com', '$2y$10$placeholder', 'admin');

INSERT INTO users (name, email, password, bio, experience_level, avg_rating, total_reviews, github_url, linkedin_url, portfolio_url, whatsapp_number)
VALUES (
    'Aanya Sharma',
    'aanya.sharma@university.edu',
    '$2y$10$placeholder',
    'Passionate design-focused developer blending aesthetics with functionality. I love collaborating on student projects that solve real campus problems. Currently exploring design systems and accessibility.',
    'Intermediate',
    4.50,
    3,
    'https://github.com/aanya-sharma',
    'https://linkedin.com/in/aanya-sharma',
    'https://aanya.dev',
    '+91 98765 43210'
);

INSERT INTO users (name, email, password, experience_level)
VALUES
('Ravi Mehta',  'ravi@university.edu',  '$2y$10$placeholder', 'Advanced'),
('Priya Nair',  'priya@university.edu', '$2y$10$placeholder', 'Intermediate'),
('Arjun Das',   'arjun@university.edu', '$2y$10$placeholder', 'Beginner');

-- ============================================================
-- SEED DATA: Set Aanya's primary domain to Web Development
-- ============================================================
UPDATE users
SET primary_domain_id = (SELECT id FROM domains WHERE name = 'Web Development')
WHERE email = 'aanya.sharma@university.edu';

-- ============================================================
-- SEED DATA: User Skills (Aanya)
-- ============================================================
INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u, skills s
WHERE u.email = 'aanya.sharma@university.edu'
AND s.name IN ('React', 'PHP', 'MySQL', 'Python', 'Figma', 'CSS', 'Node.js');

-- ============================================================
-- SEED DATA: Projects
-- ============================================================
INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
SELECT 'Campus Event Finder', 'A web app to help students discover and RSVP to campus events.', d.id, u.id, 'Intermediate', 'open'
FROM users u, domains d WHERE u.email = 'aanya.sharma@university.edu' AND d.name = 'Web Development';

INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
SELECT 'Study Group Matcher', 'Match students with similar subjects into study groups automatically.', d.id, u.id, 'Beginner', 'in_progress'
FROM users u, domains d WHERE u.email = 'aanya.sharma@university.edu' AND d.name = 'UI/UX Design';

INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
SELECT 'Library Seat Booking', 'Reserve library seats and study rooms online in advance.', d.id, u.id, 'Intermediate', 'completed'
FROM users u, domains d WHERE u.email = 'aanya.sharma@university.edu' AND d.name = 'Web Development';

INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
SELECT 'AI Tutor Bot', 'Build an AI-powered tutoring assistant for students.', d.id, u.id, 'Advanced', 'in_progress'
FROM users u, domains d WHERE u.email = 'ravi@university.edu' AND d.name = 'Machine Learning';

INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status)
SELECT 'Campus Nav App', 'Mobile app for navigating the campus with AR features.', d.id, u.id, 'Intermediate', 'open'
FROM users u, domains d WHERE u.email = 'priya@university.edu' AND d.name = 'Mobile Development';

-- ============================================================
-- SEED DATA: Project Skills
-- ============================================================
INSERT INTO project_skills (project_id, skill_id)
SELECT p.id, s.id FROM projects p, skills s
WHERE p.title = 'Campus Event Finder' AND s.name IN ('React', 'HTML', 'CSS');

INSERT INTO project_skills (project_id, skill_id)
SELECT p.id, s.id FROM projects p, skills s
WHERE p.title = 'Study Group Matcher' AND s.name IN ('Figma', 'JavaScript');

INSERT INTO project_skills (project_id, skill_id)
SELECT p.id, s.id FROM projects p, skills s
WHERE p.title = 'Library Seat Booking' AND s.name IN ('PHP', 'MySQL', 'Node.js');

INSERT INTO project_skills (project_id, skill_id)
SELECT p.id, s.id FROM projects p, skills s
WHERE p.title = 'AI Tutor Bot' AND s.name IN ('Python', 'Machine Learning', 'TensorFlow');

INSERT INTO project_skills (project_id, skill_id)
SELECT p.id, s.id FROM projects p, skills s
WHERE p.title = 'Campus Nav App' AND s.name IN ('Flutter', 'JavaScript');

-- ============================================================
-- SEED DATA: Project Members
-- ============================================================
INSERT INTO project_members (project_id, user_id, role)
SELECT p.id, u.id, 'owner'
FROM projects p, users u
WHERE p.title = 'Library Seat Booking' AND u.email = 'aanya.sharma@university.edu';

-- ============================================================
-- SEED DATA: Applications
-- ============================================================
INSERT INTO project_applications (project_id, applicant_id, status, message)
SELECT p.id, u.id, 'pending', 'I have Python and ML experience and would love to contribute!'
FROM projects p, users u
WHERE p.title = 'AI Tutor Bot' AND u.email = 'aanya.sharma@university.edu';

INSERT INTO project_applications (project_id, applicant_id, status, message)
SELECT p.id, u.id, 'pending', 'I can handle the UI/UX and React Native parts.'
FROM projects p, users u
WHERE p.title = 'Campus Nav App' AND u.email = 'aanya.sharma@university.edu';

-- ============================================================
-- SEED DATA: Ratings
-- ============================================================
INSERT INTO ratings (project_id, giver_id, receiver_id, rating, feedback)
SELECT p.id, g.id, r.id, 5, 'Aanya delivered exceptional UI work. Very responsive and detail-oriented. Would definitely collaborate again!'
FROM projects p, users g, users r
WHERE p.title = 'Library Seat Booking' AND g.email = 'ravi@university.edu' AND r.email = 'aanya.sharma@university.edu';

INSERT INTO ratings (project_id, giver_id, receiver_id, rating, feedback)
SELECT p.id, g.id, r.id, 4, 'Great collaboration on the library project. She brought creative ideas and shipped on time.'
FROM projects p, users g, users r
WHERE p.title = 'Library Seat Booking' AND g.email = 'priya@university.edu' AND r.email = 'aanya.sharma@university.edu';

INSERT INTO ratings (project_id, giver_id, receiver_id, rating, feedback)
SELECT p.id, g.id, r.id, 5, 'Super talented designer. Her Figma prototypes saved us weeks of back-and-forth.'
FROM projects p, users g, users r
WHERE p.title = 'Study Group Matcher' AND g.email = 'arjun@university.edu' AND r.email = 'aanya.sharma@university.edu';

-- ============================================================
-- SEED DATA: Notifications
-- ============================================================
INSERT INTO notifications (user_id, type, message)
SELECT id, 'application_received', 'Your application to "AI Tutor Bot" is under review.'
FROM users WHERE email = 'aanya.sharma@university.edu';

INSERT INTO notifications (user_id, type, message)
SELECT id, 'new_rating', 'You received a new 5-star rating from Ravi Mehta!'
FROM users WHERE email = 'aanya.sharma@university.edu';

INSERT INTO notifications (user_id, type, message)
SELECT id, 'project_completed', '"Library Seat Booking" has been marked as Completed.'
FROM users WHERE email = 'aanya.sharma@university.edu';

-- ============================================================
-- DONE!
-- Test with: SELECT * FROM users;
--            SELECT * FROM projects;
--            SELECT * FROM skills;
-- ============================================================