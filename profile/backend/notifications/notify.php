<?php
// ============================================================
//  NOTIFICATION HELPER
//  File: notifications/backend/notify.php
//  Usage: createNotification($conn, $user_id, 'type', 'message')
// ============================================================

function createNotification($conn, $user_id, $type, $message) {
    $stmt = $conn->prepare(
        "INSERT INTO notifications (user_id, type, message, is_read, created_at)
         VALUES (?, ?, ?, 0, NOW())"
    );
    $stmt->bind_param("iss", $user_id, $type, $message);
    return $stmt->execute();
}

// Notification type helpers
function notifyApplicationReceived($conn, $owner_id, $applicant_name, $project_name) {
    $message = "$applicant_name has applied for your project '$project_name'.";
    createNotification($conn, $owner_id, 'application_received', $message);
}

function notifyApplicationAccepted($conn, $applicant_id, $project_name) {
    $message = "Your application for '$project_name' has been accepted! 🎉";
    createNotification($conn, $applicant_id, 'application_accepted', $message);
}

function notifyApplicationRejected($conn, $applicant_id, $project_name) {
    $message = "Your application for '$project_name' was not accepted this time.";
    createNotification($conn, $applicant_id, 'application_rejected', $message);
}

function notifyNewRating($conn, $user_id, $rater_name, $rating) {
    $message = "$rater_name gave you a $rating⭐ rating.";
    createNotification($conn, $user_id, 'new_rating', $message);
}

function notifyProjectCompleted($conn, $user_id, $project_name) {
    $message = "Project '$project_name' has been marked as completed. ✅";
    createNotification($conn, $user_id, 'project_completed', $message);
}

function notifyMemberJoined($conn, $owner_id, $member_name, $project_name) {
    $message = "$member_name joined your project '$project_name'.";
    createNotification($conn, $owner_id, 'member_joined', $message);
}
?>
