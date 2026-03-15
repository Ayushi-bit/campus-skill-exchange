<?php
// ============================================================
//  UPDATE PROJECT API
//  File: backend/api/update_project.php
//  POST { action, user_id, project_id, ... }
//  action = 'update_status' | 'remove_member'
// ============================================================

require_once 'bootstrap.php';
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$data       = json_decode(file_get_contents('php://input'), true);
$action     = isset($data['action'])     ? $data['action']            : '';
$user_id    = isset($data['user_id'])    ? intval($data['user_id'])   : 0;
$project_id = isset($data['project_id']) ? intval($data['project_id']) : 0;

if (!$action || !$user_id || !$project_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

if ($user_id !== (int)$_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

$conn = getConnection();

// Verify ownership
$stmt = $conn->prepare("SELECT id FROM projects WHERE id = ? AND posted_by = ?");
$stmt->bind_param("ii", $project_id, $user_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'You do not own this project']);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// ── ACTION: update_status ─────────────────────────────────
if ($action === 'update_status') {
    $new_status = isset($data['status']) ? $data['status'] : '';
    $valid = ['open', 'in_progress', 'completed', 'closed'];
    if (!in_array($new_status, $valid)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status']);
        $conn->close();
        exit();
    }
    $stmt = $conn->prepare("UPDATE projects SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $new_status, $project_id);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    echo json_encode(['success' => true, 'message' => 'Status updated', 'new_status' => $new_status]);
    exit();
}

// ── ACTION: remove_member ─────────────────────────────────
if ($action === 'remove_member') {
    $member_id = isset($data['member_id']) ? intval($data['member_id']) : 0;
    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['error' => 'member_id is required']);
        $conn->close();
        exit();
    }
    // Can't remove yourself (owner)
    if ($member_id === $user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot remove yourself from your own project']);
        $conn->close();
        exit();
    }

    // Can't remove members when project is in progress
    $stmt = $conn->prepare("SELECT status FROM projects WHERE id = ?");
    $stmt->bind_param("i", $project_id);
    $stmt->execute();
    $proj = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($proj && $proj['status'] === 'in_progress') {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot remove teammates while project is in progress']);
        $conn->close();
        exit();
    }
    // Remove from project_members
    $stmt = $conn->prepare("DELETE FROM project_members WHERE project_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $project_id, $member_id);
    $stmt->execute();
    $stmt->close();

    // Also set their application back to rejected
    $stmt = $conn->prepare("UPDATE project_applications SET status = 'rejected' WHERE project_id = ? AND applicant_id = ?");
    $stmt->bind_param("ii", $project_id, $member_id);
    $stmt->execute();
    $stmt->close();

    // Notify the removed member
    $stmt = $conn->prepare("SELECT title FROM projects WHERE id = ?");
    $stmt->bind_param("i", $project_id);
    $stmt->execute();
    $project_title = $stmt->get_result()->fetch_assoc()['title'];
    $stmt->close();

    $msg = "You have been removed from the project \"$project_title\".";
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'project_completed', ?, 0)");
    $stmt->bind_param("is", $member_id, $msg);
    $stmt->execute();
    $stmt->close();

    $conn->close();
    echo json_encode(['success' => true, 'message' => 'Member removed']);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
?>