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
<title>Register - Campus Skill Exchange</title>
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
    background: #2ecc71;
    color: white;
}
.login { text-align: center; margin-top: 15px; }
.login a { text-decoration: none; color: #3498db; }
.error { color: red; text-align: center; margin-top: 10px; font-size: 13px; }
</style>
</head>
<body>
<div class="container">
    <h2>Create Account</h2>

    <?php if (isset($_GET['error'])): ?>
        <p class="error"><?= htmlspecialchars($_GET['error']) ?></p>
    <?php endif; ?>

    <form action="register_process.php" method="POST">
        <input type="text"  name="name"     placeholder="Full Name"      required>
        <input type="email" name="email"    placeholder="Email Address"  required>
        <input type="password" name="password" placeholder="Password"    required>
        <input type="password" name="confirm_password" placeholder="Confirm Password" required>
        <button type="submit">Send OTP & Register</button>
    </form>

    <div class="login">
        <p>Already have an account? <a href="login.php">Login</a></p>
    </div>
</div>
</body>
</html>