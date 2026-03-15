<?php
session_start();
include "../config/db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: register.php");
    exit();
}

$name     = trim($_POST['name']);
$email    = trim($_POST['email']);
$password = $_POST['password'];
$confirm  = $_POST['confirm_password'];

// Validate passwords match
if ($password !== $confirm) {
    header("Location: register.php?error=Passwords+do+not+match");
    exit();
}

// Check if email already registered
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    header("Location: register.php?error=Email+already+registered");
    exit();
}
$check->close();

// Clean up all expired OTPs
$conn->query("DELETE FROM email_verifications WHERE expires_at < NOW()");

// Generate OTP
$otp     = rand(100000, 999999);
$expires = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Delete any previous OTP for this email
$del = $conn->prepare("DELETE FROM email_verifications WHERE email = ?");
$del->bind_param("s", $email);
$del->execute();

// Insert new OTP
$ins = $conn->prepare("INSERT INTO email_verifications (email, otp, expires_at, verified) VALUES (?, ?, NOW() + INTERVAL 10 MINUTE, 0)");
$ins->bind_param("ss", $email, $otp);
$ins->execute();

// Send OTP via Gmail SMTP using PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require '../vendor/autoload.php';

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'mihiksarkar2004@gmail.com'; // <- Replace with your Gmail
    $mail->Password   = 'nuiv awxx rkqy gkjy';     // <- Replace with App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('mihiksarkar2004@gmail.com', 'Campus Skill Exchange');
    $mail->addAddress($email, $name);
    $mail->isHTML(true);
    $mail->Subject = 'Your OTP - Campus Skill Exchange';
    $mail->Body    = "
        <div style='font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;'>
            <h2 style='color:#4facfe;text-align:center;'>Campus Skill Exchange</h2>
            <p>Hi <b>$name</b>,</p>
            <p>Your OTP for registration is:</p>
            <h1 style='text-align:center;color:#2ecc71;letter-spacing:10px;'>$otp</h1>
            <p style='color:#999;font-size:12px;text-align:center;'>This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>
    ";
    $mail->send();
} catch (Exception $e) {
    error_log("Mail error: " . $mail->ErrorInfo);
}

// Store registration data in session temporarily
$_SESSION['pending_name']     = $name;
$_SESSION['pending_email']    = $email;
$_SESSION['pending_password'] = password_hash($password, PASSWORD_BCRYPT);

// Redirect to OTP verification page
header("Location: verify_otp.php");
exit();
?>