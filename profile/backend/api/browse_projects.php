<?php
// ============================================================
//  BROWSE PROJECTS API
//  File: backend/api/browse_projects.php
//  URL:  GET http://localhost/backend/api/browse_projects.php
//        ?domain_id=1&experience_level=Intermediate
//        &skills=React,PHP&search=campus&search_mode=all&user_id=2
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

$conn = getConnection();

// ── FILTERS ───────────────────────────────────────────────
$user_id          = isset($_GET['user_id'])          ? intval($_GET['user_id'])              : 0;
$domain_filter    = isset($_GET['domain_id'])         ? intval($_GET['domain_id'])            : 0;
$experience       = isset($_GET['experience_level'])  ? trim($_GET['experience_level'])       : '';
$search           = isset($_GET['search'])            ? trim($_GET['search'])                 : '';
$skills_raw       = isset($_GET['skills'])            ? trim($_GET['skills'])                 : '';
$search_mode      = isset($_GET['search_mode'])       ? trim($_GET['search_mode'])            : 'any';
$status_filter    = isset($_GET['status'])            ? trim($_GET['status'])                 : 'open';

// Parse skill names
$selected_skills = $skills_raw !== ''
    ? array_filter(array_map('trim', explode(',', $skills_raw)))
    : [];

// ── FETCH DOMAINS (for frontend filters) ──────────────────
$domainsRes = $conn->query("SELECT id, name FROM domains ORDER BY name");
$domains = [];
while ($row = $domainsRes->fetch_assoc()) {
    $domains[] = $row;
}

// ── FETCH ALL SKILLS (for frontend skill picker) ──────────
$skillsRes = $conn->query("SELECT id, name FROM skills ORDER BY name");
$allSkills = [];
while ($row = $skillsRes->fetch_assoc()) {
    $allSkills[] = $row;
}

// ── BUILD QUERY ───────────────────────────────────────────
$conditions = [];

// Status filter (default open only)
if ($status_filter !== '' && $status_filter !== 'all') {
    $safe_status = $conn->real_escape_string($status_filter);
    $conditions[] = "p.status = '$safe_status'";
} else {
    // Exclude closed projects unless explicitly requested
    $conditions[] = "p.status != 'closed'";
}

// Domain filter
if ($domain_filter > 0) {
    $conditions[] = "p.domain_id = $domain_filter";
}

// Experience level filter
if ($experience !== '') {
    $safe_exp = $conn->real_escape_string($experience);
    $conditions[] = "p.experience_level = '$safe_exp'";
}

// Text search (title + description)
if ($search !== '') {
    $safe_search = $conn->real_escape_string($search);
    $words = array_filter(array_map('trim', explode(' ', $search)));
    $name_conds = [];
    foreach ($words as $word) {
        $w = $conn->real_escape_string($word);
        $name_conds[] = "LOWER(p.title) LIKE LOWER('%$w%')";
        $name_conds[] = "LOWER(p.description) LIKE LOWER('%$w%')";
    }
    $name_conds[] = "SOUNDEX(p.title) = SOUNDEX('$safe_search')";
    $conditions[] = '(' . implode(' OR ', $name_conds) . ')';
}

// Skills filter
$skill_conditions = [];
if (!empty($selected_skills)) {
    foreach ($selected_skills as $skill_name) {
        $safe_skill = $conn->real_escape_string($skill_name);
        $res = $conn->query("SELECT id FROM skills WHERE LOWER(name) = LOWER('$safe_skill')");
        if ($res && $res->num_rows > 0) {
            $sid = $res->fetch_assoc()['id'];
            $skill_conditions[] = "EXISTS (
                SELECT 1 FROM project_skills ps2
                WHERE ps2.project_id = p.id AND ps2.skill_id = $sid
            )";
        }
    }
}

// Combine conditions by search mode
$base_sql = "
    SELECT DISTINCT p.id, p.title, p.description, p.status,
           p.experience_level, p.max_members, p.created_at,
           d.name AS domain,
           u.id   AS owner_id,
           u.name AS owner_name,
           u.avg_rating AS owner_rating,
           (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS member_count,
           (SELECT COUNT(*) FROM project_applications pa WHERE pa.project_id = p.id) AS applicant_count
    FROM projects p
    JOIN domains d ON d.id = p.domain_id
    JOIN users   u ON u.id = p.posted_by
    WHERE 1=1
";

if ($search_mode === 'all') {
    $all_conds = $conditions;
    foreach ($skill_conditions as $sc) {
        $all_conds[] = $sc;
    }
    $where = !empty($all_conds) ? ' AND ' . implode(' AND ', $all_conds) : '';
} else {
    // Base conditions always apply (status etc.), skill/search conditions are OR
    $base_conds = $conditions;
    $where = !empty($base_conds) ? ' AND ' . implode(' AND ', $base_conds) : '';
    if (!empty($skill_conditions)) {
        $where .= ' AND (' . implode(' OR ', $skill_conditions) . ')';
    }
}

$sql = $base_sql . $where . " ORDER BY p.created_at DESC LIMIT 50";
$result = $conn->query($sql);

$projects = [];
while ($row = $result->fetch_assoc()) {
    // Fetch skills for this project
    $psStmt = $conn->prepare("
        SELECT s.id, s.name FROM project_skills ps
        JOIN skills s ON s.id = ps.skill_id
        WHERE ps.project_id = ?
        ORDER BY s.name
    ");
    $psStmt->bind_param("i", $row['id']);
    $psStmt->execute();
    $psRes = $psStmt->get_result();
    $projectSkills = [];
    while ($ps = $psRes->fetch_assoc()) {
        $projectSkills[] = $ps['name'];
    }
    $psStmt->close();

    // Check if current user already applied
    $application_status = null;
    if ($user_id > 0) {
        $appStmt = $conn->prepare("
            SELECT status FROM project_applications
            WHERE project_id = ? AND applicant_id = ?
        ");
        $appStmt->bind_param("ii", $row['id'], $user_id);
        $appStmt->execute();
        $appRow = $appStmt->get_result()->fetch_assoc();
        $application_status = $appRow ? $appRow['status'] : null;
        $appStmt->close();
    }

    $projects[] = [
        "id"                 => (int) $row['id'],
        "title"              => $row['title'],
        "description"        => $row['description'],
        "domain"             => $row['domain'],
        "status"             => ucfirst(str_replace('_', ' ', $row['status'])),
        "experience_level"   => $row['experience_level'],
        "max_members"        => (int) $row['max_members'],
        "member_count"       => (int) $row['member_count'],
        "applicant_count"    => (int) $row['applicant_count'],
        "date"               => date("M j, Y", strtotime($row['created_at'])),
        "owner_id"           => (int) $row['owner_id'],
        "owner_name"         => $row['owner_name'],
        "owner_rating"       => (float) $row['owner_rating'],
        "skills"             => $projectSkills,
        "application_status" => $application_status,
        "is_owner"           => ($user_id > 0 && (int)$row['owner_id'] === $user_id),
    ];
}

$conn->close();

echo json_encode([
    "projects"   => $projects,
    "total"      => count($projects),
    "domains"    => $domains,
    "all_skills" => $allSkills,
    "filters"    => [
        "domain_id"        => $domain_filter,
        "experience_level" => $experience,
        "search"           => $search,
        "skills"           => array_values($selected_skills),
        "search_mode"      => $search_mode,
        "status"           => $status_filter,
    ],
], JSON_PRETTY_PRINT);
?>
