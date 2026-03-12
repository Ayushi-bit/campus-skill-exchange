<?php
// ============================================================
//  APPLY API
//  File: backend/api/apply.php
//  URL:  POST http://localhost/backend/api/apply.php
//  Body: { project_id, user_id, message }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'config.php';

$data       = json_decode(file_get_contents("php://input"), true);
$project_id = isset($data['project_id']) ? intval($data['project_id']) : 0;
$user_id    = isset($data['user_id'])    ? intval($data['user_id'])    : 0;
$message    = isset($data['message'])    ? trim($data['message'])      : '';

if ($project_id <= 0 || $user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid project_id or user_id"]);
    exit();
}

$conn = getConnection();

// Check project exists and is open
$stmt = $conn->prepare("SELECT id, posted_by, max_members, status FROM projects WHERE id = ?");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$project = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$project) {
    http_response_code(404);
    echo json_encode(["error" => "Project not found"]);
    exit();
}
if ($project['status'] !== 'open') {
    echo json_encode(["error" => "This project is not accepting applications"]);
    exit();
}
if ((int)$project['posted_by'] === $user_id) {
    echo json_encode(["error" => "You cannot apply to your own project"]);
    exit();
}

// Check already applied
$stmt = $conn->prepare("SELECT id, status FROM project_applications WHERE project_id = ? AND applicant_id = ?");
$stmt->bind_param("ii", $project_id, $user_id);
$stmt->execute();
$existing = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($existing) {
    echo json_encode(["error" => "You have already applied to this project", "status" => $existing['status']]);
    exit();
}

// Insert application
$stmt = $conn->prepare("
    INSERT INTO project_applications (project_id, applicant_id, status, message)
    VALUES (?, ?, 'pending', ?)
");
$stmt->bind_param("iis", $project_id, $user_id, $message);
$stmt->execute();
$stmt->close();

// Notify project owner
$notif_msg = "New application received for your project!";
$stmt = $conn->prepare("
    INSERT INTO notifications (user_id, type, message)
    VALUES (?, 'new_application', ?)
");
$stmt->bind_param("is", $project['posted_by'], $notif_msg);
$stmt->execute();
$stmt->close();

$conn->close();

echo json_encode(["success" => true, "message" => "Application submitted successfully"]);
?>
