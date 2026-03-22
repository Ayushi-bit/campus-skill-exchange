<?php
require_once 'bootstrap.php';
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
$stmt = $conn->prepare("SELECT id, posted_by, max_members, status, title FROM projects WHERE id = ?");
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
$stmt = $conn->prepare("INSERT INTO project_applications (project_id, applicant_id, status, message) VALUES (?, ?, 'pending', ?)");
$stmt->bind_param("iis", $project_id, $user_id, $message);
$stmt->execute();
$stmt->close();

// Get applicant name
$stmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Get owner email + name
$stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
$stmt->bind_param("i", $project['posted_by']);
$stmt->execute();
$owner = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Save notification in DB
$notif_msg = "{$applicant['name']} applied for your project \"{$project['title']}\".";
$stmt = $conn->prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, 'application_received', ?)");
$stmt->bind_param("is", $project['posted_by'], $notif_msg);
$stmt->execute();
$stmt->close();

$conn->close();
error_log("Sending email to: " . $owner['email'] . " type: application_received");

// Send email notification (non-blocking — won't crash if email fails)
$conn->close();

// Send email notification to project owner
try {
    require_once __DIR__ . '/../notifications/send_email_notification.php';
    sendEmailNotification($owner['email'], $owner['name'], 'application_received', $notif_msg);
} catch (Exception $e) {
    error_log("Email failed: " . $e->getMessage());
}

echo json_encode(["success" => true, "message" => "Application submitted successfully"]);
?>