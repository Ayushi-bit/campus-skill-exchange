<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized", "notifications" => [], "unread_count" => 0]);
    exit();
}

require_once __DIR__ . "/../api/config.php";
$conn = getConnection();

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare(
    "SELECT id, type, message, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 20"
);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

$unread_stmt = $conn->prepare(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0"
);
$unread_stmt->bind_param("i", $user_id);
$unread_stmt->execute();
$unread_result = $unread_stmt->get_result()->fetch_assoc();

$conn->close();

echo json_encode([
    "notifications" => $notifications,
    "unread_count"  => (int)$unread_result['count']
]);
?>