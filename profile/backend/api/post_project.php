<?php
// ============================================================
//  POST PROJECT API
//  File: backend/api/post_project.php
//  URL:  POST http://localhost/backend/api/post_project.php
//  Body: { user_id, title, description, domain_id,
//          experience_level, status, max_members,
//          skill_ids: [], new_skills: [] }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'config.php';

$body = json_decode(file_get_contents("php://input"), true);
if (!$body) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request body"]);
    exit();
}

$user_id          = isset($body['user_id'])          ? intval($body['user_id'])                 : 0;
$title            = isset($body['title'])            ? trim($body['title'])                     : '';
$description      = isset($body['description'])      ? trim($body['description'])               : '';
$domain_id        = isset($body['domain_id'])        ? intval($body['domain_id'])               : 0;
$experience_level = isset($body['experience_level']) ? trim($body['experience_level'])          : '';
$status           = isset($body['status'])           ? trim($body['status'])                    : 'open';
$max_members      = isset($body['max_members'])      ? intval($body['max_members'])             : 5;
$skill_ids        = isset($body['skill_ids'])        ? array_map('intval', $body['skill_ids']) : [];
$new_skills       = isset($body['new_skills'])       ? array_map('trim', $body['new_skills'])  : [];

// Validation
if ($user_id <= 0 || empty($title) || empty($description) || $domain_id <= 0 || empty($experience_level)) {
    http_response_code(400);
    echo json_encode(["error" => "user_id, title, description, domain_id and experience_level are required"]);
    exit();
}

$validLevels = ['Beginner', 'Intermediate', 'Advanced'];
if (!in_array($experience_level, $validLevels)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid experience level"]);
    exit();
}

$validStatuses = ['open', 'in_progress', 'completed', 'closed'];
if (!in_array($status, $validStatuses)) {
    $status = 'open';
}

if ($max_members < 1)  $max_members = 1;
if ($max_members > 20) $max_members = 20;

$conn = getConnection();

// Insert project
$stmt = $conn->prepare("
    INSERT INTO projects (title, description, domain_id, posted_by, experience_level, status, max_members)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("ssiissi", $title, $description, $domain_id, $user_id, $experience_level, $status, $max_members);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create project: " . $stmt->error]);
    exit();
}
$project_id = $conn->insert_id;
$stmt->close();

// Auto-add poster as owner in project_members
$memStmt = $conn->prepare("
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (?, ?, 'owner')
");
$memStmt->bind_param("ii", $project_id, $user_id);
$memStmt->execute();
$memStmt->close();

// Link existing skills by ID
if (!empty($skill_ids)) {
    $ins = $conn->prepare("INSERT IGNORE INTO project_skills (project_id, skill_id) VALUES (?, ?)");
    foreach ($skill_ids as $sid) {
        if ($sid > 0) {
            $ins->bind_param("ii", $project_id, $sid);
            $ins->execute();
        }
    }
    $ins->close();
}

// Add new custom skills and link them
if (!empty($new_skills)) {
    foreach ($new_skills as $skill_name) {
        if ($skill_name === '') continue;
        $safe_name = $conn->real_escape_string($skill_name);

        // Check if skill already exists
        $check = $conn->query("SELECT id FROM skills WHERE LOWER(name) = LOWER('$safe_name')");
        if ($check && $check->num_rows > 0) {
            $sid = $check->fetch_assoc()['id'];
        } else {
            $conn->query("INSERT INTO skills (name) VALUES ('$safe_name')");
            $sid = $conn->insert_id;
        }

        $ins2 = $conn->prepare("INSERT IGNORE INTO project_skills (project_id, skill_id) VALUES (?, ?)");
        $ins2->bind_param("ii", $project_id, $sid);
        $ins2->execute();
        $ins2->close();
    }
}

// Return the created project with skills
$stmt = $conn->prepare("
    SELECT p.id, p.title, p.description, p.status, p.experience_level,
           p.max_members, p.created_at, d.name AS domain
    FROM projects p
    JOIN domains d ON d.id = p.domain_id
    WHERE p.id = ?
");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$project = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Return linked skills
$skillStmt = $conn->prepare("
    SELECT s.name FROM project_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.project_id = ?
");
$skillStmt->bind_param("i", $project_id);
$skillStmt->execute();
$skillRes = $skillStmt->get_result();
$skills = [];
while ($row = $skillRes->fetch_assoc()) {
    $skills[] = $row['name'];
}
$skillStmt->close();

$conn->close();

echo json_encode([
    "success"    => true,
    "message"    => "Project created successfully",
    "project_id" => $project_id,
    "project"    => [
        "id"               => (int) $project['id'],
        "title"            => $project['title'],
        "description"      => $project['description'],
        "domain"           => $project['domain'],
        "status"           => $project['status'],
        "experience_level" => $project['experience_level'],
        "max_members"      => (int) $project['max_members'],
        "date"             => date("M j, Y", strtotime($project['created_at'])),
        "skills"           => $skills,
    ],
]);
?>
