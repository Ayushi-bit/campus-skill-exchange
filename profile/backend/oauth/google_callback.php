<?php
// ============================================================
//  GOOGLE OAUTH CALLBACK
//  File: oauth/google_callback.php
//  After Google login → redirects to React app
// ============================================================
session_start();
include "../config/db.php";

$env           = parse_ini_file(__DIR__ . '/../.env');
$client_id     = $env['CLIENT_ID'];
$client_secret = $env['CLIENT_SECRET'];
$redirect_uri = "http://localhost/backend/oauth/google_callback.php";

if (!isset($_GET['code'])) {
    header("Location: ../auth/login.php?error=Google+login+failed");
    exit();
}

// Exchange code for token
$token_url = "https://oauth2.googleapis.com/token";
$post_data = http_build_query([
    'code'          => $_GET['code'],
    'client_id'     => $client_id,
    'client_secret' => $client_secret,
    'redirect_uri'  => $redirect_uri,
    'grant_type'    => 'authorization_code',
]);

$ch = curl_init($token_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$response  = curl_exec($ch);
curl_close($ch);

$token_data   = json_decode($response, true);
$access_token = $token_data['access_token'] ?? null;

if (!$access_token) {
    header("Location: ../auth/login.php?error=Could+not+get+Google+token");
    exit();
}

// Get user info
$ch = curl_init("https://www.googleapis.com/oauth2/v2/userinfo");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
$user_response = curl_exec($ch);
curl_close($ch);

$google_user = json_decode($user_response, true);
$google_id   = $google_user['id']    ?? null;
$email       = $google_user['email'] ?? null;
$name        = $google_user['name']  ?? null;

if (!$email) {
    header("Location: ../auth/login.php?error=Could+not+retrieve+Google+email");
    exit();
}

// Check if user exists, else create
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ? OR google_id = ?");
$stmt->bind_param("ss", $email, $google_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($user_id, $user_name);
    $stmt->fetch();
    $upd = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
    $upd->bind_param("si", $google_id, $user_id);
    $upd->execute();
} else {
    $ins = $conn->prepare("INSERT INTO users (name, email, google_id, password) VALUES (?, ?, ?, '')");
    $ins->bind_param("sss", $name, $email, $google_id);
    $ins->execute();
    $user_id   = $conn->insert_id;
    $user_name = $name;
}

$_SESSION['user_id'] = $user_id;
$_SESSION['name']    = $user_name;

// ← Redirect to React app
header("Location: http://localhost:3000");
exit();
?>
