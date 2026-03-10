<?php
// ============================================================
//  EDIT PROFILE API ENDPOINT (v2 — includes contact fields)
//  File: backend/api/edit_profile.php
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
$conn = getConnection();

// ============================================================
//  GET — Fetch current user data for edit form
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid user_id"]);
        exit();
    }

    $stmt = $conn->prepare("
        SELECT u.id, u.name, u.email, u.bio, u.profile_image,
               u.experience_level, u.primary_domain_id,
               u.github_url, u.linkedin_url, u.portfolio_url, u.whatsapp_number,
               COALESCE(d.name, 'Student') AS domain_name
        FROM users u
        LEFT JOIN domains d ON d.id = u.primary_domain_id
        WHERE u.id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit();
    }

    // All domains for dropdown
    $domainsResult = $conn->query("SELECT id, name FROM domains ORDER BY name");
    $domains = [];
    while ($row = $domainsResult->fetch_assoc()) {
        $domains[] = $row;
    }

    // All skills for picker
    $allSkillsResult = $conn->query("SELECT id, name FROM skills ORDER BY name");
    $allSkills = [];
    while ($row = $allSkillsResult->fetch_assoc()) {
        $allSkills[] = $row;
    }

    // User's current skills
    $stmt2 = $conn->prepare("
        SELECT s.id, s.name FROM user_skills us
        JOIN skills s ON s.id = us.skill_id
        WHERE us.user_id = ? ORDER BY s.name
    ");
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $userSkillsRes = $stmt2->get_result();
    $userSkills = [];
    while ($row = $userSkillsRes->fetch_assoc()) {
        $userSkills[] = $row;
    }
    $stmt2->close();

    $conn->close();

    echo json_encode([
        "user"        => $user,
        "domains"     => $domains,
        "all_skills"  => $allSkills,
        "user_skills" => $userSkills,
    ], JSON_PRETTY_PRINT);
    exit();
}

// ============================================================
//  POST — Save updated profile data
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $body = json_decode(file_get_contents("php://input"), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid request body"]);
        exit();
    }

    // Extract fields
    $user_id           = isset($body['user_id'])           ? intval($body['user_id'])            : 0;
    $name              = isset($body['name'])              ? trim($body['name'])                  : '';
    $email             = isset($body['email'])             ? trim($body['email'])                 : '';
    $bio               = isset($body['bio'])               ? trim($body['bio'])                   : '';
    $profile_image     = isset($body['profile_image'])     ? trim($body['profile_image'])         : '';
    $experience_level  = isset($body['experience_level'])  ? trim($body['experience_level'])      : '';
    $primary_domain_id = isset($body['primary_domain_id']) ? intval($body['primary_domain_id'])  : null;
    $github_url        = isset($body['github_url'])        ? trim($body['github_url'])            : '';
    $linkedin_url      = isset($body['linkedin_url'])      ? trim($body['linkedin_url'])          : '';
    $portfolio_url     = isset($body['portfolio_url'])     ? trim($body['portfolio_url'])         : '';
    $whatsapp_number   = isset($body['whatsapp_number'])   ? trim($body['whatsapp_number'])       : '';
    $skill_ids         = isset($body['skill_ids'])         ? array_map('intval', $body['skill_ids']) : [];

    // Validation
    if ($user_id <= 0 || empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(["error" => "user_id, name and email are required"]);
        exit();
    }

    $validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!in_array($experience_level, $validLevels)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid experience level"]);
        exit();
    }

    // Check email not taken by another user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $user_id);
    $stmt->execute();
    if ($stmt->get_result()->fetch_assoc()) {
        http_response_code(409);
        echo json_encode(["error" => "Email already in use by another account"]);
        exit();
    }
    $stmt->close();

    // Update users table
    $stmt = $conn->prepare("
        UPDATE users
        SET name = ?, email = ?, bio = ?, profile_image = ?,
            experience_level = ?, primary_domain_id = ?,
            github_url = ?, linkedin_url = ?, portfolio_url = ?, whatsapp_number = ?
        WHERE id = ?
    ");
    $stmt->bind_param(
        "sssssissssi",
        $name, $email, $bio, $profile_image,
        $experience_level, $primary_domain_id,
        $github_url, $linkedin_url, $portfolio_url, $whatsapp_number,
        $user_id
    );

    if ($stmt->execute()) {
        $stmt->close();

        // Update skills: delete old, insert new
        $del = $conn->prepare("DELETE FROM user_skills WHERE user_id = ?");
        $del->bind_param("i", $user_id);
        $del->execute();
        $del->close();

        if (!empty($skill_ids)) {
            $ins = $conn->prepare("INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)");
            foreach ($skill_ids as $sid) {
                $ins->bind_param("ii", $user_id, $sid);
                $ins->execute();
            }
            $ins->close();
        }

        // Return updated user
        $stmt2 = $conn->prepare("
            SELECT u.id, u.name, u.email, u.bio, u.profile_image,
                   u.experience_level, u.primary_domain_id,
                   u.github_url, u.linkedin_url, u.portfolio_url, u.whatsapp_number,
                   COALESCE(d.name, 'Student') AS domain_name
            FROM users u
            LEFT JOIN domains d ON d.id = u.primary_domain_id
            WHERE u.id = ?
        ");
        $stmt2->bind_param("i", $user_id);
        $stmt2->execute();
        $updatedUser = $stmt2->get_result()->fetch_assoc();
        $stmt2->close();

        // Return updated skills
        $skillStmt = $conn->prepare("
            SELECT s.name FROM user_skills us
            JOIN skills s ON s.id = us.skill_id
            WHERE us.user_id = ?
        ");
        $skillStmt->bind_param("i", $user_id);
        $skillStmt->execute();
        $skillRes = $skillStmt->get_result();
        $updatedSkills = [];
        while ($row = $skillRes->fetch_assoc()) {
            $updatedSkills[] = $row['name'];
        }
        $skillStmt->close();
        $conn->close();

        echo json_encode([
            "success" => true,
            "message" => "Profile updated successfully",
            "user"    => $updatedUser,
            "skills"  => $updatedSkills,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update profile"]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
