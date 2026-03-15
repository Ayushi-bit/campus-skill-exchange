<?php
// ============================================================
//  DATABASE CONFIGURATION
//  File: config/db.php
//  NOTE: Changed database to campus_skill_exchange (not campus_skill_exchange2)
// ============================================================

$host     = "localhost";
$user     = "root";
$password = "";
$database = "campus_skill_exchange"; // ← fixed

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
