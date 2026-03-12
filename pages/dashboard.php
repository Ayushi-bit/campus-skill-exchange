<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../auth/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard - Campus Skill Exchange</title>
<style>
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
}
nav {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}
nav h1 { margin: 0; font-size: 20px; }
nav a {
    color: white;
    text-decoration: none;
    background: rgba(0,0,0,0.2);
    padding: 8px 16px;
    border-radius: 5px;
    font-size: 14px;
}
nav a:hover { background: rgba(0,0,0,0.35); }
.content {
    padding: 40px;
    text-align: center;
}
.welcome-card {
    background: white;
    display: inline-block;
    padding: 40px 60px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.welcome-card h2 { margin: 0 0 10px; color: #333; }
.welcome-card p  { color: #666; }
</style>
</head>
<body>

<nav>
    <h1>Campus Skill Exchange</h1>
    <a href="../auth/logout.php">Logout</a>
</nav>

<div class="content">
    <div class="welcome-card">
        <h2>Welcome, <?= htmlspecialchars($_SESSION['name']) ?>! 👋</h2>
        <p>You are successfully logged in.</p>
        <p>Your dashboard is being set up...</p>
    </div>
</div>

</body>
</html>