<?php
// ============================================================
//  CHANGE PASSWORD API
//  File: backend/api/change_password.php
//  Method: POST
//  Body: { "user_id": int, "current_password": string, "new_password": string }
//  Google OAuth users can skip current_password and set a new one
// ============================================================

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

$data             = json_decode(file_get_contents('php://input'), true);
$user_id          = isset($data['user_id'])          ? (int)$data['user_id']           : 0;
$current_password = isset($data['current_password']) ? trim($data['current_password']) : '';
$new_password     = isset($data['new_password'])     ? trim($data['new_password'])      : '';

// Prevent changing someone else's password
if ($user_id !== (int)$_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

if (!$user_id || !$new_password) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID and new password are required']);
    exit();
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'New password must be at least 6 characters']);
    exit();
}

$conn = getConnection();

// Fetch user
$stmt = $conn->prepare("SELECT password, google_id FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    $conn->close();
    exit();
}

// Empty password string means user registered via Google OAuth
$isGoogleUser = ($user['password'] === '');

if (!$isGoogleUser) {
    // Regular users must verify their current password
    if (!$current_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Current password is required']);
        $conn->close();
        exit();
    }
    if (!password_verify($current_password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        $conn->close();
        exit();
    }
    // New password must differ from current
    if (password_verify($new_password, $user['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be different from your current password']);
        $conn->close();
        exit();
    }
}

// Hash and save new password
$new_hash = password_hash($new_password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $new_hash, $user_id);
$stmt->execute();
$updated = $stmt->affected_rows;
$stmt->close();
$conn->close();

if ($updated === 0) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update password. Please try again.']);
    exit();
}

echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
?>