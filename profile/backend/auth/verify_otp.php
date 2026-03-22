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
    $password = $_SESSION['pending_password'];
    $otp      = trim($_POST['otp']);

    $stmt = $conn->prepare(
        "SELECT id FROM email_verifications
         WHERE email = ? AND otp = ? AND expires_at > NOW() AND verified = 0"
    );
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $upd = $conn->prepare("UPDATE email_verifications SET verified = 1 WHERE email = ?");
        $upd->bind_param("s", $email);
        $upd->execute();

        $ins = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $ins->bind_param("sss", $name, $email, $password);
        $ins->execute();
        $user_id = $conn->insert_id;

        $_SESSION['user_id'] = $user_id;
        $_SESSION['name']    = $name;

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
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify OTP - Campus Skill Exchange</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Nunito:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Nunito', sans-serif;
    background: #FDF6EC;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: #FFFDF8;
    padding: 48px 40px;
    border-radius: 20px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(107, 58, 31, 0.14);
    border: 1px solid #D9C9A8;
    text-align: center;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.logo {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #C8733A, #D4A574);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin: 0 auto 20px;
}

h2 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    color: #6B3A1F;
    margin-bottom: 8px;
}

p.sub {
    color: #9A7B5A;
    font-size: 13px;
    margin-bottom: 8px;
    line-height: 1.6;
}

p.email {
    font-weight: 700;
    color: #C8733A;
    font-size: 14px;
    margin-bottom: 28px;
    font-family: 'DM Mono', monospace;
}

.otp-input {
    width: 100%;
    padding: 16px;
    border-radius: 10px;
    border: 2px solid #D9C9A8;
    font-size: 28px;
    text-align: center;
    letter-spacing: 12px;
    background: #F5ECD8;
    color: #4A2C0A;
    outline: none;
    transition: all 0.2s;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
}

.otp-input:focus {
    border-color: #C8733A;
    background: #FFFDF8;
    box-shadow: 0 0 0 3px rgba(200, 115, 58, 0.12);
}

.btn {
    width: 100%;
    padding: 13px;
    margin-top: 16px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    background: linear-gradient(135deg, #C8733A, #E8935A);
    color: white;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    letter-spacing: 0.03em;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(200, 115, 58, 0.3);
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(200, 115, 58, 0.4);
}

.btn:active { transform: translateY(0); }

.error {
    color: #C84040;
    margin-top: 14px;
    font-size: 13px;
    padding: 10px 14px;
    background: rgba(200, 64, 64, 0.08);
    border: 1px solid rgba(200, 64, 64, 0.25);
    border-radius: 8px;
}

.timer {
    margin-top: 16px;
    font-size: 12px;
    color: #9A7B5A;
    font-family: 'DM Mono', monospace;
}

.timer span {
    color: #C8733A;
    font-weight: 700;
}

.back {
    margin-top: 20px;
    font-size: 13px;
}

.back a {
    color: #C8733A;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;
}

.back a:hover { color: #E8935A; }

.hint {
    margin-top: 14px;
    font-size: 12px;
    color: #9A7B5A;
    line-height: 1.5;
}
</style>
</head>
<body>
<div class="container">

    <div class="logo">C</div>

    <h2>Verify Your Email ✉️</h2>
    <p class="sub">We sent a 6-digit OTP to</p>
    <p class="email"><?= htmlspecialchars($_SESSION['pending_email']) ?></p>

    <?php if ($error): ?>
        <div class="error">⚠️ <?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST">
        <input
            type="text"
            name="otp"
            class="otp-input"
            placeholder="000000"
            maxlength="6"
            required
            autofocus
            inputmode="numeric"
            pattern="[0-9]*"
        >
        <button type="submit" class="btn">✅ Verify OTP</button>
    </form>

    <div class="timer">
        OTP expires in <span id="countdown">10:00</span>
    </div>

    <p class="hint">Didn't receive it? Check your spam folder.</p>

    <div class="back">
        <a href="register.php">← Back to Register</a>
    </div>
</div>

<script>
// Countdown timer
let seconds = 600;
const el = document.getElementById('countdown');
const interval = setInterval(() => {
    seconds--;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
    if (seconds <= 0) {
        clearInterval(interval);
        el.textContent = 'Expired';
        el.style.color = '#C84040';
    }
}, 1000);

// Auto-submit when 6 digits entered
document.querySelector('input[name="otp"]').addEventListener('input', function() {
    if (this.value.length === 6) {
        this.closest('form').submit();
    }
});
</script>
</body>
</html>