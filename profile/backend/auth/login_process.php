<?php
// ============================================================
//  LOGIN PROCESS
//  File: auth/login_process.php
// ============================================================

// Configure session cookie BEFORE session_start()
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_path', '/');

session_start();
include "../config/db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: http://localhost:3000");
    exit();
}

$email    = trim($_POST['email']);
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    header("Location: http://localhost:3000?error=No+account+found+with+that+email");
    exit();
}

$stmt->bind_result($id, $name, $hashed_password);
$stmt->fetch();

if (!password_verify($password, $hashed_password)) {
    header("Location: http://localhost:3000?error=Incorrect+password");
    exit();
}

$_SESSION['user_id'] = $id;
$_SESSION['name']    = $name;

header("Location: http://localhost:3000");
exit();