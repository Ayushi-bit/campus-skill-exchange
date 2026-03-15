<?php
// ============================================================
//  MY PROJECTS API
//  File: backend/api/my_projects.php
//  GET ?user_id=X
//  Returns owned projects + projects user is a member of
// ============================================================

require_once 'bootstrap.php';
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid user_id']);
    exit();
}

$conn = getConnection();

// ── Owned projects ────────────────────────────────────────
$stmt = $conn->prepare("
    SELECT
        p.id, p.title, p.description, p.status, p.experience_level,
        p.max_members, p.created_at,
        d.name AS domain,
        COUNT(DISTINCT pm.user_id) AS member_count,
        COUNT(DISTINCT CASE WHEN pa.status = 'pending' THEN pa.id END) AS pending_count,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS skills
    FROM projects p
    LEFT JOIN domains d ON d.id = p.domain_id
    LEFT JOIN project_members pm ON pm.project_id = p.id
    LEFT JOIN project_applications pa ON pa.project_id = p.id
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    WHERE p.posted_by = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$owned = [];
while ($row = $res->fetch_assoc()) {
    $owned[] = [
        'id'            => (int) $row['id'],
        'title'         => $row['title'],
        'description'   => $row['description'],
        'status'        => $row['status'],
        'experience_level' => $row['experience_level'],
        'max_members'   => (int) $row['max_members'],
        'member_count'  => (int) $row['member_count'],
        'pending_count' => (int) $row['pending_count'],
        'domain'        => $row['domain'],
        'skills'        => $row['skills'] ? explode(', ', $row['skills']) : [],
        'created_at'    => date("M j, Y", strtotime($row['created_at'])),
    ];
}
$stmt->close();

// ── Member of projects (not owned) ───────────────────────
$stmt = $conn->prepare("
    SELECT
        p.id, p.title, p.description, p.status, p.experience_level,
        p.max_members, p.created_at,
        d.name AS domain,
        u.name AS owner_name,
        COUNT(DISTINCT pm2.user_id) AS member_count,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS skills
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    LEFT JOIN domains d ON d.id = p.domain_id
    LEFT JOIN users u ON u.id = p.posted_by
    LEFT JOIN project_members pm2 ON pm2.project_id = p.id
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    WHERE pm.user_id = ? AND p.posted_by != ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
");
$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$res = $stmt->get_result();
$member_of = [];
while ($row = $res->fetch_assoc()) {
    $member_of[] = [
        'id'            => (int) $row['id'],
        'title'         => $row['title'],
        'description'   => $row['description'],
        'status'        => $row['status'],
        'experience_level' => $row['experience_level'],
        'max_members'   => (int) $row['max_members'],
        'member_count'  => (int) $row['member_count'],
        'domain'        => $row['domain'],
        'owner_name'    => $row['owner_name'],
        'skills'        => $row['skills'] ? explode(', ', $row['skills']) : [],
        'created_at'    => date("M j, Y", strtotime($row['created_at'])),
    ];
}
$stmt->close();
$conn->close();

echo json_encode([
    'owned'     => $owned,
    'member_of' => $member_of,
]);
?>
