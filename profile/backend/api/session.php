<?php
// ============================================================
//  SESSION API
//  File: backend/api/session.php
//  URL:  GET http://localhost/backend/api/session.php
//  Returns current logged-in user from PHP session
//  React calls this on every app load to check auth status
// ============================================================

// CORS — must allow credentials for session cookies to work
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configure session cookie BEFORE session_start()
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_path', '/');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated", "authenticated" => false]);
    exit();
}

require_once 'config.php';
$conn = getConnection();

// Fetch fresh user data from DB — also fetch google_id to detect OAuth users
$stmt = $conn->prepare("
    SELECT u.id, u.name, u.email, u.profile_image, u.experience_level,
           u.avg_rating, u.password, COALESCE(d.name, 'Student') AS primary_domain
    FROM users u
    LEFT JOIN domains d ON d.id = u.primary_domain_id
    WHERE u.id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$user) {
    // User deleted from DB but session still exists — clear it
    session_destroy();
    http_response_code(401);
    echo json_encode(["error" => "User not found", "authenticated" => false]);
    exit();
}

echo json_encode([
    "authenticated" => true,
    "user" => [
        "id"               => (int) $user['id'],
        "name"             => $user['name'],
        "email"            => $user['email'],
        "profile_image"    => $user['profile_image'] ?? '',
        "experience_level" => $user['experience_level'] ?? 'Beginner',
        "primary_domain"   => $user['primary_domain'],
        "avg_rating"       => (float) $user['avg_rating'],
        "is_google_user"   => ($user['password'] === ''), // true if signed up via Google OAuth
    ]
]);
?>