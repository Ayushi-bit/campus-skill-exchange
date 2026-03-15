<?php
// ============================================================
//  APPLICATIONS API
//  File: backend/api/applications.php
//  GET ?user_id=X&type=sent    → applications user sent
//  GET ?user_id=X&type=received → applications received on user's projects
// ============================================================

require_once 'bootstrap.php';
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$type    = isset($_GET['type'])    ? $_GET['type']            : 'sent';

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid user_id']);
    exit();
}

$conn = getConnection();

if ($type === 'sent') {
    // Applications submitted by this user
    $stmt = $conn->prepare("
        SELECT
            pa.id, pa.status, pa.message, pa.applied_at,
            p.id   AS project_id,
            p.title AS project_title,
            p.status AS project_status,
            p.experience_level,
            d.name AS domain,
            u.id   AS owner_id,
            u.name AS owner_name,
            u.avg_rating AS owner_rating
        FROM project_applications pa
        JOIN projects p ON p.id = pa.project_id
        JOIN domains  d ON d.id = p.domain_id
        JOIN users    u ON u.id = p.posted_by
        WHERE pa.applicant_id = ?
        ORDER BY pa.applied_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $applications = [];
    while ($row = $res->fetch_assoc()) {
        $applications[] = [
            'id'             => (int) $row['id'],
            'status'         => $row['status'],
            'message'        => $row['message'] ?? '',
            'applied_at'     => date("M j, Y", strtotime($row['applied_at'])),
            'project_id'     => (int) $row['project_id'],
            'project_title'  => $row['project_title'],
            'project_status' => $row['project_status'],
            'experience_level' => $row['experience_level'],
            'domain'         => $row['domain'],
            'owner_id'       => (int) $row['owner_id'],
            'owner_name'     => $row['owner_name'],
            'owner_rating'   => (float) $row['owner_rating'],
        ];
    }
    $stmt->close();
    $conn->close();
    echo json_encode(['type' => 'sent', 'applications' => $applications]);

} else {
    // Applications received on projects owned by this user
    $stmt = $conn->prepare("
        SELECT
            pa.id, pa.status, pa.message, pa.applied_at,
            p.id   AS project_id,
            p.title AS project_title,
            p.status AS project_status,
            u.id   AS applicant_id,
            u.name AS applicant_name,
            u.email AS applicant_email,
            u.experience_level,
            u.avg_rating,
            COALESCE(d.name, 'General') AS applicant_domain,
            GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') AS skills
        FROM project_applications pa
        JOIN projects p ON p.id = pa.project_id
        JOIN users    u ON u.id = pa.applicant_id
        LEFT JOIN domains d ON d.id = u.primary_domain_id
        LEFT JOIN user_skills us ON us.user_id = u.id
        LEFT JOIN skills s ON s.id = us.skill_id
        WHERE p.posted_by = ?
        GROUP BY pa.id, p.id, p.title, p.status, u.id, u.name, u.email, u.experience_level, u.avg_rating, d.name
        ORDER BY pa.applied_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $applications = [];
    while ($row = $res->fetch_assoc()) {
        $applications[] = [
            'id'              => (int) $row['id'],
            'status'          => $row['status'],
            'message'         => $row['message'] ?? '',
            'applied_at'      => date("M j, Y", strtotime($row['applied_at'])),
            'project_id'      => (int) $row['project_id'],
            'project_title'   => $row['project_title'],
            'project_status'  => $row['project_status'],
            'applicant_id'    => (int) $row['applicant_id'],
            'applicant_name'  => $row['applicant_name'],
            'applicant_email' => $row['applicant_email'],
            'experience_level'=> $row['experience_level'],
            'avg_rating'      => (float) $row['avg_rating'],
            'domain'          => $row['applicant_domain'],
            'skills'          => $row['skills'] ? explode(', ', $row['skills']) : [],
        ];
    }
    $stmt->close();
    $conn->close();
    echo json_encode(['type' => 'received', 'applications' => $applications]);
}
?>