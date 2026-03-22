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

$data        = json_decode(file_get_contents('php://input'), true);
$project_id  = isset($data['project_id'])  ? intval($data['project_id'])  : 0;
$receiver_id = isset($data['receiver_id']) ? intval($data['receiver_id']) : 0;
$rating      = isset($data['rating'])      ? intval($data['rating'])      : 0;
$feedback    = isset($data['feedback'])    ? trim($data['feedback'])      : '';
$giver_id    = (int) $_SESSION['user_id'];

if (!$project_id || !$receiver_id || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data. Rating must be between 1 and 5.']);
    exit();
}

if ($giver_id === $receiver_id) {
    http_response_code(400);
    echo json_encode(['error' => 'You cannot rate yourself']);
    exit();
}

$conn = getConnection();

// Check project is completed
$stmt = $conn->prepare("SELECT status, title FROM projects WHERE id = ?");
$stmt->bind_param("i", $project_id);
$stmt->execute();
$project = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$project || $project['status'] !== 'completed') {
    http_response_code(400);
    echo json_encode(['error' => 'Ratings are only allowed for completed projects']);
    $conn->close();
    exit();
}

// Check giver is a member
$stmt = $conn->prepare("SELECT id FROM project_members WHERE project_id = ? AND user_id = ?");
$stmt->bind_param("ii", $project_id, $giver_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'You are not a member of this project']);
    $stmt->close(); $conn->close(); exit();
}
$stmt->close();

// Check receiver is a member
$stmt = $conn->prepare("SELECT id FROM project_members WHERE project_id = ? AND user_id = ?");
$stmt->bind_param("ii", $project_id, $receiver_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Receiver is not a member of this project']);
    $stmt->close(); $conn->close(); exit();
}
$stmt->close();

// Check not already rated
$stmt = $conn->prepare("SELECT id FROM ratings WHERE project_id = ? AND giver_id = ? AND receiver_id = ?");
$stmt->bind_param("iii", $project_id, $giver_id, $receiver_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'You have already rated this person for this project']);
    $stmt->close(); $conn->close(); exit();
}
$stmt->close();

// Insert rating
$stmt = $conn->prepare("INSERT INTO ratings (project_id, giver_id, receiver_id, rating, feedback) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iiiis", $project_id, $giver_id, $receiver_id, $rating, $feedback);
$stmt->execute();
$stmt->close();

// Update receiver avg_rating
$stmt = $conn->prepare("UPDATE users SET avg_rating = (SELECT ROUND(AVG(rating), 1) FROM ratings WHERE receiver_id = ?) WHERE id = ?");
$stmt->bind_param("ii", $receiver_id, $receiver_id);
$stmt->execute();
$stmt->close();

// Get giver name
$stmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
$stmt->bind_param("i", $giver_id);
$stmt->execute();
$giver = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Get receiver email + name
$stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
$stmt->bind_param("i", $receiver_id);
$stmt->execute();
$receiver = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Stars string
$stars = str_repeat('⭐', $rating);

// Notification message
$notif_msg = "{$giver['name']} gave you a {$rating}-star rating {$stars} on \"{$project['title']}\".";
if ($feedback) {
    $notif_msg .= " They said: \"{$feedback}\"";
}

// Save notification in DB
$stmt = $conn->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'new_rating', ?, 0)");
$stmt->bind_param("is", $receiver_id, $notif_msg);
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