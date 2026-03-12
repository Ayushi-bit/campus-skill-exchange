<?php
// ============================================================
//  DASHBOARD API
//  File: backend/api/dashboard.php
//  URL:  GET http://localhost/backend/api/dashboard.php?user_id=2
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid user_id"]);
    exit();
}

$conn = getConnection();

// ── 1. USER (welcome section) ──────────────────────────────
$stmt = $conn->prepare("
    SELECT u.id, u.name, u.email, u.experience_level,
           u.avg_rating, u.total_reviews, u.profile_image,
           u.bio, u.github_url, u.linkedin_url,
           u.portfolio_url, u.whatsapp_number,
           COALESCE(d.name, 'Not Set') AS primary_domain
    FROM users u
    LEFT JOIN domains d ON d.id = u.primary_domain_id
    WHERE u.id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

// ── 2. QUICK STATS ─────────────────────────────────────────
$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM projects WHERE posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$posted = (int) $stmt->get_result()->fetch_assoc()['c'];
$stmt->close();

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM project_applications WHERE applicant_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$applied = (int) $stmt->get_result()->fetch_assoc()['c'];
$stmt->close();

$stmt = $conn->prepare("
    SELECT COUNT(*) AS c FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.user_id = ? AND p.status = 'completed'
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$completed = (int) $stmt->get_result()->fetch_assoc()['c'];
$stmt->close();

// Profile completion score
$fields = [
    $user['name'], $user['email'], $user['bio'],
    $user['experience_level'], $user['primary_domain'],
    $user['github_url'], $user['linkedin_url'],
    $user['portfolio_url'], $user['whatsapp_number'],
    $user['profile_image'],
];
$filled = count(array_filter($fields, fn($v) => !empty($v) && $v !== 'Not Set'));
$completion = (int) round(($filled / count($fields)) * 100);

// ── 3. ACTIVE PROJECTS (projects user posted OR joined) ──
$stmt = $conn->prepare("
    SELECT DISTINCT p.id, p.title, p.status, p.max_members, p.created_at,
           d.name AS domain,
           (SELECT COUNT(*) FROM project_applications pa
            WHERE pa.project_id = p.id AND pa.status = 'pending') AS pending_applicants,
           (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) AS member_count
    FROM projects p
    JOIN domains d ON d.id = p.domain_id
    LEFT JOIN project_members pm ON pm.project_id = p.id
    WHERE (p.posted_by = ? OR pm.user_id = ?)
    AND p.status IN ('open','in_progress')
    ORDER BY p.created_at DESC
    LIMIT 5
");

$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$res = $stmt->get_result();
$activeProjects = [];
while ($r = $res->fetch_assoc()) {
    $activeProjects[] = [
        "id"                => (int) $r['id'],
        "title"             => $r['title'],
        "status"            => ucfirst(str_replace('_', ' ', $r['status'])),
        "domain"            => $r['domain'],
        "pending_applicants"=> (int) $r['pending_applicants'],
        "member_count"      => (int) $r['member_count'],
        "max_members"       => (int) $r['max_members'],
        "date"              => date("M j, Y", strtotime($r['created_at'])),
    ];
}
$stmt->close();

// ── 4. MY APPLICATIONS ────────────────────────────────────
$stmt = $conn->prepare("
    SELECT p.id, p.title, d.name AS domain, pa.status, pa.applied_at,
       u.name AS owner_name
    FROM project_applications pa
    JOIN projects p ON p.id = pa.project_id
    JOIN domains d ON d.id = p.domain_id
    JOIN users u ON u.id = p.posted_by
    WHERE pa.applicant_id = ?
    ORDER BY pa.applied_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$myApplications = [];
while ($r = $res->fetch_assoc()) {
    $myApplications[] = [
    "id"         => (int) $r['id'],
    "title"      => $r['title'],
    "domain"     => $r['domain'],
    "status"     => ucfirst($r['status']),
    "owner_name" => $r['owner_name'],
    "date"       => date("M j, Y", strtotime($r['applied_at'])),
];
}
$stmt->close();

// ── 5. RECENT ACTIVITY (notifications) ────────────────────
$stmt = $conn->prepare("
    SELECT message, type, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 6
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$activity = [];
while ($r = $res->fetch_assoc()) {
    $activity[] = [
        "message" => $r['message'],
        "type"    => $r['type'] ?? 'default',
        "is_read" => (bool) $r['is_read'],
        "date"    => date("M j, Y", strtotime($r['created_at'])),
    ];
}
$stmt->close();

$conn->close();

// ── BUILD RESPONSE ────────────────────────────────────────
echo json_encode([
    "user" => [
        "id"               => (int) $user['id'],
        "name"             => $user['name'],
        "email"            => $user['email'],
        "experience_level" => $user['experience_level'] ?? 'Beginner',
        "primary_domain"   => $user['primary_domain'],
        "avg_rating"       => (float) $user['avg_rating'],
        "profile_image"    => $user['profile_image'] ?? '',
    ],
    "stats" => [
        "projects_posted"    => $posted,
        "applications_sent"  => $applied,
        "projects_completed" => $completed,
        "avg_rating"         => (float) $user['avg_rating'],
        "profile_completion" => $completion,
    ],
    "active_projects" => $activeProjects,
    "my_applications" => $myApplications,
    "recent_activity" => $activity,
], JSON_PRETTY_PRINT);
?>
