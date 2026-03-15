<?php
// Configure session cookie BEFORE session_start()
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_path', '/');

session_start();
include "../config/db.php";

// If no pending registration, redirect back
if (!isset($_SESSION['pending_email'])) {
    header("Location: register.php");
    exit();
}

$error   = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = $_SESSION['pending_email'];
    $name     = $_SESSION['pending_name'];
    $password = $_SESSION['pending_password']; // already hashed
    $otp      = trim($_POST['otp']);

    $stmt = $conn->prepare(
        "SELECT id FROM email_verifications
         WHERE email = ? AND otp = ? AND expires_at > NOW() AND verified = 0"
    );
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Mark OTP as verified
        $upd = $conn->prepare("UPDATE email_verifications SET verified = 1 WHERE email = ?");
        $upd->bind_param("s", $email);
        $upd->execute();

        // Insert user
        $ins = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $ins->bind_param("sss", $name, $email, $password);
        $ins->execute();
        $user_id = $conn->insert_id;

        // Log the user in
        $_SESSION['user_id'] = $user_id;
        $_SESSION['name']    = $name;

        // Clear pending data
        unset($_SESSION['pending_name'], $_SESSION['pending_email'], $_SESSION['pending_password']);

        header("Location: http://localhost:3000");
        exit();
    } else {
        $error = "Invalid or expired OTP. Please try again.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Verify OTP - Campus Skill Exchange</title>
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
    text-align: center;
}
h2 { margin-bottom: 10px; }
p.sub { color: #666; font-size: 13px; margin-bottom: 20px; }
input {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 20px;
    text-align: center;
    letter-spacing: 8px;
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
.error   { color: red;   margin-top: 10px; font-size: 13px; }
.success { color: green; margin-top: 10px; font-size: 13px; }
.back { margin-top: 15px; font-size: 13px; }
.back a { color: #3498db; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
    <h2>Verify Your Email</h2>
    <p class="sub">We sent a 6-digit OTP to<br><strong><?= htmlspecialchars($_SESSION['pending_email']) ?></strong></p>

    <?php if ($error):   ?><p class="error"><?= $error ?></p><?php endif; ?>
    <?php if ($success): ?><p class="success"><?= $success ?></p><?php endif; ?>

    <form method="POST">
        <input type="text" name="otp" placeholder="000000" maxlength="6" required autofocus>
        <button type="submit">Verify OTP</button>
    </form>

    <div class="back">
        <a href="register.php">← Back to Register</a>
    </div>
</div>
</body>
</html>