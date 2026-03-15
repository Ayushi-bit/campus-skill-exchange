<?php
// ============================================================
//  DELETE ACCOUNT API
//  File: backend/api/delete_account.php
//  Method: POST
//  Body: { "user_id": int, "password": string }
//  Verifies password then deletes ALL user data in safe order
//  Google OAuth users skip password check
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

$data     = json_decode(file_get_contents('php://input'), true);
$user_id  = isset($data['user_id']) ? (int)$data['user_id'] : 0;
$password = isset($data['password']) ? trim($data['password']) : '';

if ($user_id !== (int)$_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit();
}

$conn = getConnection();

// ── Step 1: Verify identity ───────────────────────────────
$stmt = $conn->prepare("SELECT password, email, google_id FROM users WHERE id = ?");
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
    // Regular users must verify their password
    if (!$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Password is required']);
        $conn->close();
        exit();
    }
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect password. Please try again.']);
        $conn->close();
        exit();
    }
}

// ── Step 2: Delete in safe order ─────────────────────────

// 2a. Ratings where user is giver or receiver
$stmt = $conn->prepare("DELETE FROM ratings WHERE giver_id = ? OR receiver_id = ?");
$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$stmt->close();

// 2b. Notifications for this user
$stmt = $conn->prepare("DELETE FROM notifications WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2c. Applications submitted by this user
$stmt = $conn->prepare("DELETE FROM project_applications WHERE applicant_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2d. Memberships for this user
$stmt = $conn->prepare("DELETE FROM project_members WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2e. For projects OWNED by this user — delete dependent rows first
$stmt = $conn->prepare("DELETE ps FROM project_skills ps INNER JOIN projects p ON p.id = ps.project_id WHERE p.posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("DELETE pa FROM project_applications pa INNER JOIN projects p ON p.id = pa.project_id WHERE p.posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("DELETE pm FROM project_members pm INNER JOIN projects p ON p.id = pm.project_id WHERE p.posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2f. Delete projects owned by this user
$stmt = $conn->prepare("DELETE FROM projects WHERE posted_by = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2g. User skills
$stmt = $conn->prepare("DELETE FROM user_skills WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2h. Email verifications
$stmt = $conn->prepare("DELETE FROM email_verifications WHERE email = ?");
$stmt->bind_param("s", $user['email']);
$stmt->execute();
$stmt->close();

// 2i. Password resets (uses user_id not email)
$stmt = $conn->prepare("DELETE FROM password_resets WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->close();

// 2j. Finally delete the user
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$deleted = $stmt->affected_rows;
$stmt->close();
$conn->close();

if ($deleted === 0) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete account. Please try again.']);
    exit();
}

// ── Step 3: Destroy session ───────────────────────────────
session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Account deleted successfully']);
?>