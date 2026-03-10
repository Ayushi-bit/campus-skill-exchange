<?php
// ============================================================
//  PROFILE API ENDPOINT (v2 — includes contact fields)
//  File: backend/api/profile.php
//  URL:  http://localhost/backend/api/profile.php?user_id=2
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 1;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid user_id"]);
    exit();
}

$conn = getConnection();

// ──────────────────────────────────────────────
// 1. FETCH USER BASIC INFO + CONTACT FIELDS
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT u.id, u.name, u.email, u.bio, u.profile_image,
           u.experience_level, u.avg_rating, u.total_reviews,
           u.github_url, u.linkedin_url, u.portfolio_url, u.whatsapp_number,
           COALESCE(d.name, 'Student') AS domain_name
    FROM users u
    LEFT JOIN domains d ON d.id = u.primary_domain_id
    WHERE u.id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$userResult = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$userResult) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

// ──────────────────────────────────────────────
// 2. FETCH USER SKILLS
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT s.id, s.name
    FROM user_skills us
    JOIN skills s ON s.id = us.skill_id
    WHERE us.user_id = ?
    ORDER BY s.name
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$skillsResult = $stmt->get_result();
$skills = [];
while ($row = $skillsResult->fetch_assoc()) {
    $skills[] = $row;
}
$stmt->close();

// ──────────────────────────────────────────────
// 3. FETCH ANALYTICS
// ──────────────────────────────────────────────
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM projects WHERE posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$postedCount = $stmt->get_result()->fetch_assoc()['total'];
$stmt->close();

$stmt = $conn->prepare("
    SELECT COUNT(*) as total
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.user_id = ? AND p.status = 'completed'
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$completedCount = $stmt->get_result()->fetch_assoc()['total'];
$stmt->close();

$stmt = $conn->prepare("SELECT COUNT(*) as total FROM project_applications WHERE applicant_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$appliedCount = $stmt->get_result()->fetch_assoc()['total'];
$stmt->close();

$analytics = [
    "posted"    => (int) $postedCount,
    "completed" => (int) $completedCount,
    "applied"   => (int) $appliedCount,
    "rating"    => (float) $userResult['avg_rating'],
];

// ──────────────────────────────────────────────
// 4. FETCH PROJECTS — POSTED (with skills)
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT p.id, p.title, d.name as domain, p.status, p.created_at
    FROM projects p
    JOIN domains d ON d.id = p.domain_id
    WHERE p.posted_by = ?
    ORDER BY p.created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$postedProjects = [];
while ($row = $res->fetch_assoc()) {
    // Fetch skills for each project
    $psStmt = $conn->prepare("
        SELECT s.name FROM project_skills ps
        JOIN skills s ON s.id = ps.skill_id
        WHERE ps.project_id = ?
    ");
    $psStmt->bind_param("i", $row['id']);
    $psStmt->execute();
    $psRes = $psStmt->get_result();
    $projectSkills = [];
    while ($ps = $psRes->fetch_assoc()) {
        $projectSkills[] = $ps['name'];
    }
    $psStmt->close();

    $postedProjects[] = [
        "title"  => $row['title'],
        "domain" => $row['domain'],
        "status" => ucfirst(str_replace('_', ' ', $row['status'])),
        "date"   => date("M j, Y", strtotime($row['created_at'])),
        "skills" => $projectSkills,
    ];
}
$stmt->close();

// ──────────────────────────────────────────────
// 5. FETCH PROJECTS — APPLIED
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT p.title, d.name as domain, p.status, pa.applied_at
    FROM project_applications pa
    JOIN projects p ON p.id = pa.project_id
    JOIN domains d ON d.id = p.domain_id
    WHERE pa.applicant_id = ?
    ORDER BY pa.applied_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$appliedProjects = [];
while ($row = $res->fetch_assoc()) {
    $appliedProjects[] = [
        "title"  => $row['title'],
        "domain" => $row['domain'],
        "status" => ucfirst(str_replace('_', ' ', $row['status'])),
        "date"   => date("M j, Y", strtotime($row['applied_at'])),
    ];
}
$stmt->close();

// ──────────────────────────────────────────────
// 6. FETCH PROJECTS — COMPLETED
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT p.title, d.name as domain, p.status, pm.joined_at, pm.role
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    JOIN domains d ON d.id = p.domain_id
    WHERE pm.user_id = ? AND p.status = 'completed'
    ORDER BY pm.joined_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$completedProjects = [];
while ($row = $res->fetch_assoc()) {
    $completedProjects[] = [
        "title"  => $row['title'],
        "domain" => $row['domain'],
        "status" => "Completed",
        "date"   => date("M j, Y", strtotime($row['joined_at'])),
        "role"   => $row['role'],
    ];
}
$stmt->close();

// ──────────────────────────────────────────────
// 7. FETCH REVIEWS
// ──────────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT u.name, r.rating, r.feedback, r.created_at
    FROM ratings r
    JOIN users u ON u.id = r.giver_id
    WHERE r.receiver_id = ?
    ORDER BY r.created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$reviews = [];
while ($row = $res->fetch_assoc()) {
    $reviews[] = [
        "name"   => $row['name'],
        "rating" => (int) $row['rating'],
        "text"   => $row['feedback'],
        "date"   => date("M Y", strtotime($row['created_at'])),
    ];
}
$stmt->close();

$conn->close();

// ──────────────────────────────────────────────
// 8. BUILD & RETURN FINAL JSON
// ──────────────────────────────────────────────
$response = [
    "user" => [
        "id"              => (int) $userResult['id'],
        "name"            => $userResult['name'],
        "email"           => $userResult['email'],
        "bio"             => $userResult['bio'] ?? "",
        "domain"          => $userResult['domain_name'] ?? "Student",
        "level"           => $userResult['experience_level'] ?? "Beginner",
        "rating"          => (float) $userResult['avg_rating'],
        "profile_image"   => $userResult['profile_image'] ?? "",
        // Contact fields
        "github_url"      => $userResult['github_url'] ?? "",
        "linkedin_url"    => $userResult['linkedin_url'] ?? "",
        "portfolio_url"   => $userResult['portfolio_url'] ?? "",
        "whatsapp_number" => $userResult['whatsapp_number'] ?? "",
    ],
    "skills"    => array_column($skills, 'name'),
    "analytics" => $analytics,
    "projects"  => [
        "posted"    => $postedProjects,
        "applied"   => $appliedProjects,
        "completed" => $completedProjects,
    ],
    "reviews" => $reviews,
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
