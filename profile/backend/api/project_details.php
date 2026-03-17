<?php
require_once 'bootstrap.php';
// ============================================================
//  PROJECT DETAILS API
//  File: backend/api/project_details.php
//  URL:  GET http://localhost/backend/api/project_details.php?project_id=1&user_id=2
// ============================================================

require_once 'config.php';

$project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : 0;
$user_id    = isset($_GET['user_id'])    ? intval($_GET['user_id'])    : 0;

if ($project_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid project_id"]);
    exit();
}

$conn = getConnection();

// ── 1. PROJECT + OWNER ─────────────────────────────────────
$stmt = $conn->prepare("
    SELECT
        p.id, p.title, p.description, p.status,
        p.experience_level, p.max_members, p.created_at,
        d.name AS domain,
        u.id   AS owner_id,
        u.name AS owner_name,
        u.bio  AS owner_bio,
        u.avg_rating,
        u.profile_image,
        u.github_url,
        u.linkedin_url,
        u.portfolio_url,
        u.whatsapp_number
    FROM projects p
    JOIN domains d ON d.id = p.domain_id
    JOIN users   u ON u.id = p.posted_by
    WHERE p.id = ?
");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$project = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$project) {
    http_response_code(404);
    echo json_encode(["error" => "Project not found"]);
    exit();
}

// ── 2. REQUIRED SKILLS ─────────────────────────────────────
$stmt = $conn->prepare("
    SELECT s.name
    FROM project_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.project_id = ?
    ORDER BY s.name
");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$res    = $stmt->get_result();
$skills = [];
while ($row = $res->fetch_assoc()) {
    $skills[] = $row['name'];
}
$stmt->close();

// ── 3. TEAM MEMBERS ────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT u.id, u.name, u.experience_level, u.avg_rating, pm.role
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ?
    ORDER BY pm.role DESC, pm.joined_at ASC
");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$res     = $stmt->get_result();
$members = [];
while ($row = $res->fetch_assoc()) {
    $members[] = [
        "id"               => (int) $row['id'],
        "name"             => $row['name'],
        "experience_level" => $row['experience_level'] ?? 'Beginner',
        "avg_rating"       => (float) $row['avg_rating'],
        "role"             => $row['role'],
    ];
}
$stmt->close();

// ── 4. OWNER SKILLS ────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT s.name
    FROM user_skills us
    JOIN skills s ON s.id = us.skill_id
    WHERE us.user_id = ?
    ORDER BY s.name
");
$stmt->bind_param("i", $project['owner_id']);
$stmt->execute();
$res = $stmt->get_result();
$owner_skills = [];
while ($row = $res->fetch_assoc()) {
    $owner_skills[] = $row['name'];
}
$stmt->close();

// ── 5. APPLICATION STATUS FOR LOGGED-IN USER ───────────────
$application_status = "not_applied";
if ($user_id > 0) {
    $stmt = $conn->prepare("
        SELECT status FROM project_applications
        WHERE project_id = ? AND applicant_id = ?
    ");
    $stmt->bind_param("ii", $project_id, $user_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if ($row) {
        $application_status = $row['status'];
    }
    $stmt->close();
}

// ── 6. TOTAL APPLICANT COUNT ───────────────────────────────
$stmt = $conn->prepare("
    SELECT COUNT(*) AS total FROM project_applications
    WHERE project_id = ?
");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$total_applicants = (int) $stmt->get_result()->fetch_assoc()['total'];
$stmt->close();

// ── 7. CHECK IF LOGGED-IN USER IS OWNER ────────────────────
$is_owner = ($user_id > 0 && (int)$project['owner_id'] === $user_id);

// ── 8. FETCH ALREADY RATED MEMBERS BY LOGGED-IN USER ───────
$already_rated = [];

if ($user_id > 0) {
    $stmt = $conn->prepare("
        SELECT receiver_id
        FROM ratings
        WHERE project_id = ? AND giver_id = ?
    ");
    $stmt->bind_param("ii", $project_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();

    while ($row = $res->fetch_assoc()) {
        $already_rated[] = (int) $row['receiver_id'];
    }

    $stmt->close();
}

$conn->close();

// ── FINAL RESPONSE ─────────────────────────────────────────
echo json_encode([
    "project" => [
        "id"               => (int) $project['id'],
        "title"            => $project['title'],
        "description"      => $project['description'],
        "domain"           => $project['domain'],
        "status"           => $project['status'],
        "experience_level" => $project['experience_level'],
        "max_members"      => (int) $project['max_members'],
        "created_at"       => date("M j, Y", strtotime($project['created_at'])),
    ],
    "owner" => [
        "id"              => (int) $project['owner_id'],
        "name"            => $project['owner_name'],
        "bio"             => $project['owner_bio'] ?? "",
        "avg_rating"      => (float) $project['avg_rating'],
        "profile_image"   => $project['profile_image'] ?? "",
        "github_url"      => $project['github_url'] ?? "",
        "linkedin_url"    => $project['linkedin_url'] ?? "",
        "portfolio_url"   => $project['portfolio_url'] ?? "",
        "whatsapp_number" => $project['whatsapp_number'] ?? "",
        "skills"          => $owner_skills,
    ],
    "skills"             => $skills,
    "members"            => $members,
    "application_status" => $application_status,
    "total_applicants"   => $total_applicants,
    "is_owner"           => $is_owner,
    "already_rated"      => $already_rated,
], JSON_PRETTY_PRINT);
?>