<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: ../pages/dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login - Campus Skill Exchange</title>
<style>
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.container {
    background: white;
    padding: 40px;
    border-radius: 10px;
    width: 350px;
    box-shadow: 0px 8px 25px rgba(0,0,0,0.2);
}
h2 { text-align: center; margin-bottom: 25px; }
input {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 14px;
    box-sizing: border-box;
}
button {
    width: 100%;
    padding: 10px;
    margin-top: 15px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
}
.login-btn    { background: #2ecc71; color: white; }
.google-btn   { background: #db4437; color: white; }
.facebook-btn { background: #1877f2; color: white; }
.divider { text-align: center; margin: 15px 0; font-size: 13px; color: #999; }
.signup  { text-align: center; margin-top: 15px; }
.signup a { text-decoration: none; color: #3498db; }
.error { color: red; text-align: center; margin-top: 10px; font-size: 13px; }
</style>
</head>
<body>
<div class="container">
    <h2>Campus Skill Exchange</h2>

    <?php if (isset($_GET['error'])): ?>
        <p class="error"><?= htmlspecialchars($_GET['error']) ?></p>
    <?php endif; ?>

    <form action="login_process.php" method="POST">
        <input type="email"    name="email"    placeholder="Enter Email"    required>
        <input type="password" name="password" placeholder="Enter Password" required>
        <button type="submit" class="login-btn">Login</button>
    </form>

    <div class="divider">OR</div>

    <button class="google-btn"
        onclick="window.location.href='../oauth/google_login.php'">
        Login with Google
    </button>

    <button class="facebook-btn"
        onclick="window.location.href='../oauth/facebook_login.php'">
        Login with Facebook
    </button>

    <div class="signup">
        <p>Don't have an account? <a href="register.php">Sign Up</a></p>
    </div>
</div>
</body>
</html>