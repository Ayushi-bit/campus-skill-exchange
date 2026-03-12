<?php
session_start();
include "../config/db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: login.php");
    exit();
}

$email    = trim($_POST['email']);
$password = $_POST['password'];

// Use prepared statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    header("Location: login.php?error=No+account+found+with+that+email");
    exit();
}

$stmt->bind_result($id, $name, $hashed_password);
$stmt->fetch();

if (!password_verify($password, $hashed_password)) {
    header("Location: login.php?error=Incorrect+password");
    exit();
}

$_SESSION['user_id'] = $id;
$_SESSION['name']    = $name;

header("Location: ../pages/dashboard.php");
exit();
?>