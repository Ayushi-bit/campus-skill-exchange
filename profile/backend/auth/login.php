<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: http://localhost:3000");
    exit();
}
// Redirect errors back to React
if (isset($_GET['error'])) {
    header("Location: http://localhost:3000?error=" . urlencode($_GET['error']));
    exit();
}
// If someone visits this PHP page directly, send them to React
header("Location: http://localhost:3000");
exit();
?>