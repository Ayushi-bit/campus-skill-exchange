<?php
// ============================================================
//  COMMON API BOOTSTRAP
//  File: backend/api/bootstrap.php
//  Include at top of every API file instead of repeating
//  CORS + session headers everywhere
// ============================================================

// Allow React dev server origin with credentials
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configure session cookie BEFORE session_start()
// SameSite=None allows cookie to be sent cross-port
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_path', '/');

session_start();
?>