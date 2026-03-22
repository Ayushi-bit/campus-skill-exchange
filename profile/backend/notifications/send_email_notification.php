<?php
// ============================================================
//  EMAIL NOTIFICATION HELPER
//  File: profile/backend/notifications/backend/send_email_notification.php
//  Usage: sendEmailNotification($email, $name, $type, $message)
// ============================================================

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';

function sendEmailNotification($to_email, $to_name, $type, $message) {

    // Icons and subjects for each notification type
    $types = [
        'application_received'  => ['icon' => '📩', 'subject' => 'New Application Received',       'color' => '#C8733A'],
        'application_accepted'  => ['icon' => '✅', 'subject' => 'Your Application Was Accepted!', 'color' => '#5A8A5A'],
        'application_rejected'  => ['icon' => '❌', 'subject' => 'Application Update',             'color' => '#C84040'],
        'new_application'       => ['icon' => '📬', 'subject' => 'New Application Received',       'color' => '#C8733A'],
        'new_rating'            => ['icon' => '⭐', 'subject' => 'You Received a New Rating!',     'color' => '#D4A574'],
        'project_completed'     => ['icon' => '🏁', 'subject' => 'Project Completed!',             'color' => '#5A8A5A'],
        'member_joined'         => ['icon' => '👥', 'subject' => 'New Member Joined Your Project', 'color' => '#C8733A'],
    ];

    $info    = $types[$type] ?? ['icon' => '🔔', 'subject' => 'Campus Skill Exchange Notification', 'color' => '#C8733A'];
    $icon    = $info['icon'];
    $subject = $info['subject'];
    $color   = $info['color'];

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'mihiksarkar2004@gmail.com';
        $mail->Password   = 'nuiv awxx rkqy gkjy';
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('mihiksarkar2004@gmail.com', 'Campus Skill Exchange');
        $mail->addAddress($to_email, $to_name);
        $mail->isHTML(true);
        $mail->Subject = $subject . ' — Campus Skill Exchange';

        $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
          <link href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap' rel='stylesheet'>
        </head>
        <body style='margin:0;padding:0;background:#FDF6EC;font-family:Nunito,Arial,sans-serif;'>
          <div style='max-width:520px;margin:32px auto;background:#FFFDF8;border-radius:16px;border:1px solid #D9C9A8;overflow:hidden;box-shadow:0 4px 20px rgba(107,58,31,0.1);'>

            <!-- Header -->
            <div style='background:linear-gradient(135deg,#C8733A,#D4A574);padding:28px 32px;text-align:center;'>
              <div style='font-size:36px;margin-bottom:8px;'>{$icon}</div>
              <h1 style='margin:0;color:white;font-size:20px;font-weight:700;'>{$subject}</h1>
            </div>

            <!-- Body -->
            <div style='padding:32px;'>
              <p style='color:#9A7B5A;font-size:14px;margin:0 0 8px;'>Hi <strong style='color:#6B3A1F;'>{$to_name}</strong>,</p>
              <div style='background:#F5ECD8;border-left:4px solid {$color};border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;'>
                <p style='margin:0;color:#4A2C0A;font-size:15px;line-height:1.6;'>{$message}</p>
              </div>
              <a href='http://localhost:3000'
                 style='display:inline-block;margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#C8733A,#E8935A);color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;'>
                View on Campus Skill Exchange →
              </a>
            </div>

            <!-- Footer -->
            <div style='padding:16px 32px;border-top:1px solid #EDE0C4;text-align:center;'>
              <p style='margin:0;color:#9A7B5A;font-size:11px;'>
                Campus Skill Exchange · You're receiving this because you have an account.<br>
              </p>
            </div>
          </div>
        </body>
        </html>
        ";

        $mail->AltBody = "$icon $subject\n\nHi $to_name,\n\n$message\n\nVisit: http://localhost:3000";
        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("Email notification failed to $to_email: " . $mail->ErrorInfo);
        return false;
    }
}
?>
