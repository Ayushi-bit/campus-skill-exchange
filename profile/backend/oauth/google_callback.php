<?php
// ============================================================
//  GOOGLE OAUTH CALLBACK
//  File: profile/backend/oauth/google_callback.php
// ============================================================

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_path', '/');

session_start();

require_once __DIR__ . "/../api/config.php";
$conn = getConnection();

$env           = parse_ini_file(__DIR__ . '/../.env');
$client_id     = $env['CLIENT_ID'];
$client_secret = $env['CLIENT_SECRET'];
$redirect_uri  = "http://localhost/Campus-Skill-Exchange-Platform/profile/backend/oauth/google_callback.php";

if (!isset($_GET['code'])) {
    header("Location: http://localhost:3000?error=Google+login+failed");
    exit();
}

// Step 1: Exchange code for access token
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
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

$token_data   = json_decode($response, true);
$access_token = $token_data['access_token'] ?? null;

if (!$access_token) {
    header("Location: http://localhost:3000?error=Could+not+get+Google+token");
    exit();
}

// Step 2: Get user info from Google
$ch = curl_init("https://www.googleapis.com/oauth2/v2/userinfo");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
$user_response = curl_exec($ch);
curl_close($ch);

$google_user = json_decode($user_response, true);
$google_id   = $google_user['id']    ?? null;
$email       = $google_user['email'] ?? null;
$name        = $google_user['name']  ?? null;

if (!$email) {
    header("Location: http://localhost:3000?error=Could+not+retrieve+Google+email");
    exit();
}

// Step 3: Check if user exists, else create
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ? OR google_id = ?");
$stmt->bind_param("ss", $email, $google_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Existing user — log in
    $stmt->bind_result($user_id, $user_name);
    $stmt->fetch();
    $stmt->close();

    // Update google_id if not set
    $upd = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
    $upd->bind_param("si", $google_id, $user_id);
    $upd->execute();
    $upd->close();
} else {
    // New user — register
    $stmt->close();
    $ins = $conn->prepare("INSERT INTO users (name, email, google_id, password) VALUES (?, ?, ?, '')");
    $ins->bind_param("sss", $name, $email, $google_id);
    $ins->execute();
    $user_id   = $conn->insert_id;
    $user_name = $name;
    $ins->close();
}

$conn->close();

// Step 4: Set session and redirect to React
$_SESSION['user_id'] = $user_id;
$_SESSION['name']    = $user_name;

header("Location: http://localhost:3000");
exit();
?>