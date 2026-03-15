<?php
// ============================================================
//  LOGOUT API
//  File: backend/api/logout_api.php
//  React calls GET /backend/api/logout_api.php to log out
// ============================================================

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
session_unset();
session_destroy();

echo json_encode(["success" => true, "message" => "Logged out"]);
?>
