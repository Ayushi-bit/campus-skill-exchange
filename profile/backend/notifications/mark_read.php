<?php
// ============================================================
//  MARK NOTIFICATIONS AS READ
//  File: notifications/backend/mark_read.php
// ============================================================
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

require_once __DIR__ . "/../api/config.php";
$conn = getConnection();

$user_id = $_SESSION['user_id'];
$data    = json_decode(file_get_contents("php://input"), true);
$id      = $data['id'] ?? null; // specific id or null = mark all

if ($id) {
    // Mark single notification as read
    $stmt = $conn->prepare(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?"
    );
    $stmt->bind_param("ii", $id, $user_id);
} else {
    // Mark ALL as read
    $stmt = $conn->prepare(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ?"
    );
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
echo json_encode(["success" => true]);
?>
