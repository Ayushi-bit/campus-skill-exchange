<?php
require_once 'bootstrap.php';
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$data           = json_decode(file_get_contents('php://input'), true);
$application_id = isset($data['application_id']) ? intval($data['application_id']) : 0;
$action         = isset($data['action'])         ? trim($data['action'])            : '';
$user_id        = isset($data['user_id'])        ? intval($data['user_id'])         : 0;

if (!$application_id || !in_array($action, ['accept', 'reject']) || !$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit();
}

if ($user_id !== (int)$_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

$conn = getConnection();

// Get application details
$stmt = $conn->prepare("
    SELECT pa.id, pa.applicant_id, pa.status,
           p.posted_by, p.id AS project_id, p.title,
           u.name AS applicant_name, u.email AS applicant_email
    FROM project_applications pa
    JOIN projects p ON p.id = pa.project_id
    JOIN users u ON u.id = pa.applicant_id
    WHERE pa.id = ?
");
$stmt->bind_param("i", $application_id);
$stmt->execute();
$app = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$app) {
    http_response_code(404);
    echo json_encode(['error' => 'Application not found']);
    $conn->close();
    exit();
}

if ((int)$app['posted_by'] !== $user_id) {
    http_response_code(403);
    echo json_encode(['error' => 'You are not the owner of this project']);
    $conn->close();
    exit();
}

if ($app['status'] !== 'pending') {
    http_response_code(400);
    echo json_encode(['error' => 'Application has already been ' . $app['status']]);
    $conn->close();
    exit();
}

$new_status = $action === 'accept' ? 'accepted' : 'rejected';

// Update application status
$stmt = $conn->prepare("UPDATE project_applications SET status = ? WHERE id = ?");
$stmt->bind_param("si", $new_status, $application_id);
$stmt->execute();
$stmt->close();

// If accepted → add to project_members
if ($action === 'accept') {
    $stmt = $conn->prepare("INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, 'member')");
    $stmt->bind_param("ii", $app['project_id'], $app['applicant_id']);
    $stmt->execute();
    $stmt->close();
}

// Notification message
$notif_type = $action === 'accept' ? 'application_accepted' : 'application_rejected';
$notif_msg  = $action === 'accept'
    ? "Your application to \"{$app['title']}\" was accepted! 🎉 Welcome to the team!"
    : "Your application to \"{$app['title']}\" was not accepted this time. Keep exploring other projects!";

// Save notification in DB
$stmt = $conn->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, ?, ?, 0)");
$stmt->bind_param("iss", $app['applicant_id'], $notif_type, $notif_msg);
$stmt->execute();
$stmt->close();

$conn->close();

// Send email notification (non-blocking — won't crash if email fails)
try {
    require_once __DIR__ . '/../notifications/send_email_notification.php';
    sendEmailNotification($app['applicant_email'], $app['applicant_name'], $notif_type, $notif_msg);
} catch (Exception $e) {
    error_log("Email failed: " . $e->getMessage());
}

echo json_encode([
    'success'    => true,
    'message'    => "Application {$new_status} successfully",
    'new_status' => $new_status,
]);
?>