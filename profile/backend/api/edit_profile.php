<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ============================================================
//  EDIT PROFILE API ENDPOINT (v3 — email change verification)
//  File: backend/api/edit_profile.php
//
//  POST actions:
//    action = "save"         → normal save (email unchanged)
//    action = "send_otp"     → email changed, send OTP to new email
//    action = "verify_otp"   → verify OTP, then save everything
// ============================================================

require_once 'bootstrap.php';
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

    $domainsResult = $conn->query("SELECT id, name FROM domains ORDER BY name");
    $domains = [];
    while ($row = $domainsResult->fetch_assoc()) $domains[] = $row;

    $allSkillsResult = $conn->query("SELECT id, name FROM skills ORDER BY name");
    $allSkills = [];
    while ($row = $allSkillsResult->fetch_assoc()) $allSkills[] = $row;

    $stmt2 = $conn->prepare("
        SELECT s.id, s.name FROM user_skills us
        JOIN skills s ON s.id = us.skill_id
        WHERE us.user_id = ? ORDER BY s.name
    ");
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $userSkillsRes = $stmt2->get_result();
    $userSkills = [];
    while ($row = $userSkillsRes->fetch_assoc()) $userSkills[] = $row;
    $stmt2->close();

    $conn->close();
    echo json_encode([
        "user"        => $user,
        "domains"     => $domains,
        "all_skills"  => $allSkills,
        "user_skills" => $userSkills,
    ]);
    exit();
}

// ============================================================
//  POST — Save / Send OTP / Verify OTP
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $body = json_decode(file_get_contents("php://input"), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid request body"]);
        exit();
    }

    $action  = isset($body['action']) ? $body['action'] : 'save';
    $user_id = isset($body['user_id']) ? intval($body['user_id']) : 0;

    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid user_id"]);
        exit();
    }

    // ── Helper: extract all profile fields from body ──────
    function extractFields($body) {
        return [
            'name'              => isset($body['name'])              ? trim($body['name'])                                : '',
            'email'             => isset($body['email'])             ? trim($body['email'])                               : '',
            'bio'               => isset($body['bio'])               ? trim($body['bio'])                                 : '',
            'profile_image'     => isset($body['profile_image'])     ? trim($body['profile_image'])                       : '',
            'experience_level'  => isset($body['experience_level'])  ? trim($body['experience_level'])                    : '',
            'primary_domain_id' => (isset($body['primary_domain_id']) && $body['primary_domain_id'] !== '') ? intval($body['primary_domain_id']) : null,
            'github_url'        => isset($body['github_url'])        ? trim($body['github_url'])                          : '',
            'linkedin_url'      => isset($body['linkedin_url'])      ? trim($body['linkedin_url'])                        : '',
            'portfolio_url'     => isset($body['portfolio_url'])     ? trim($body['portfolio_url'])                       : '',
            'whatsapp_number'   => isset($body['whatsapp_number'])   ? trim($body['whatsapp_number'])                     : '',
            'skill_ids'         => isset($body['skill_ids'])         ? array_map('intval', $body['skill_ids'])            : [],
        ];
    }

    // ── Helper: save profile to DB ────────────────────────
    function saveProfile($conn, $user_id, $f) {
        $validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        if (empty($f['name']) || empty($f['email'])) return ["error" => "Name and email are required"];
        if (!in_array($f['experience_level'], $validLevels)) return ["error" => "Invalid experience level"];

        $stmt = $conn->prepare("UPDATE users SET name=?, email=?, bio=?, profile_image=?, experience_level=?, primary_domain_id=?, github_url=?, linkedin_url=?, portfolio_url=?, whatsapp_number=? WHERE id=?");
        $stmt->bind_param("ssssssssssi",
            $f['name'], $f['email'], $f['bio'], $f['profile_image'],
            $f['experience_level'], $f['primary_domain_id'],
            $f['github_url'], $f['linkedin_url'], $f['portfolio_url'], $f['whatsapp_number'],
            $user_id
        );
        $stmt->execute();
        $stmt->close();

        // Update skills
        $del = $conn->prepare("DELETE FROM user_skills WHERE user_id = ?");
        $del->bind_param("i", $user_id);
        $del->execute();
        $del->close();

        if (!empty($f['skill_ids'])) {
            $ins = $conn->prepare("INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)");
            foreach ($f['skill_ids'] as $sid) {
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
            FROM users u LEFT JOIN domains d ON d.id = u.primary_domain_id
            WHERE u.id = ?
        ");
        $stmt2->bind_param("i", $user_id);
        $stmt2->execute();
        $updatedUser = $stmt2->get_result()->fetch_assoc();
        $stmt2->close();

        $skillStmt = $conn->prepare("SELECT s.name FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.user_id = ?");
        $skillStmt->bind_param("i", $user_id);
        $skillStmt->execute();
        $updatedSkills = [];
        $skillResult = $skillStmt->get_result();
        while ($row = $skillResult->fetch_assoc()) $updatedSkills[] = $row['name'];
        $skillStmt->close();

        return ["success" => true, "message" => "Profile updated successfully", "user" => $updatedUser, "skills" => $updatedSkills];
    }

    // ── Get current email ──────────────────────────────────
    $stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $currentUser = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$currentUser) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit();
    }

    $f = extractFields($body);

    // ── ACTION: save (email not changed) ──────────────────
    if ($action === 'save') {

        // If email changed, force OTP flow
        if (strtolower($f['email']) !== strtolower($currentUser['email'])) {
            http_response_code(400);
            echo json_encode(["error" => "Email changed. Please use the verify email flow.", "email_changed" => true]);
            exit();
        }

        // Check email not taken by another user
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $f['email'], $user_id);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            http_response_code(409);
            echo json_encode(["error" => "Email already in use by another account"]);
            exit();
        }
        $stmt->close();

        $result = saveProfile($conn, $user_id, $f);
        $conn->close();
        if (isset($result['error'])) { http_response_code(400); }
        echo json_encode($result);
        exit();
    }

    // ── ACTION: send_otp (email changed, send OTP) ────────
    if ($action === 'send_otp') {

        $new_email = $f['email'];

        if (empty($new_email) || !filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email address"]);
            exit();
        }

        // Check new email not already taken
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $new_email, $user_id);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            http_response_code(409);
            echo json_encode(["error" => "Email already in use by another account"]);
            exit();
        }
        $stmt->close();

        // Generate OTP
        $otp = strval(rand(100000, 999999));

        // Delete old OTPs for this email
        $del = $conn->prepare("DELETE FROM email_verifications WHERE email = ?");
        $del->bind_param("s", $new_email);
        $del->execute();
        $del->close();

        // Insert new OTP — use MySQL NOW() to avoid PHP timezone issues
        $ins = $conn->prepare("INSERT INTO email_verifications (email, otp, expires_at, verified) VALUES (?, ?, NOW() + INTERVAL 10 MINUTE, 0)");
        $ins->bind_param("ss", $new_email, $otp);
        $ins->execute();
        $ins->close();
        $conn->close();

        // Send OTP email via PHPMailer
        require_once __DIR__ . '/../vendor/autoload.php';

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
            $mail->addAddress($new_email);
            $mail->Subject = 'Verify your new email — Campus Skill Exchange';
            $mail->Body    = "Your OTP to verify your new email address is: $otp\n\nThis OTP expires in 10 minutes.";
            $mail->send();

            echo json_encode(["success" => true, "message" => "OTP sent to $new_email", "email_verification_required" => true]);
        } catch (Exception $e) {
            echo json_encode(["error" => "Failed to send OTP email. Please try again."]);
        }
        exit();
    }

    // ── ACTION: verify_otp (check OTP then save) ──────────
    if ($action === 'verify_otp') {

        $new_email = $f['email'];
        $otp       = isset($body['otp']) ? trim($body['otp']) : '';

        if (empty($otp)) {
            http_response_code(400);
            echo json_encode(["error" => "OTP is required"]);
            exit();
        }

        // Verify OTP
        $stmt = $conn->prepare("SELECT id FROM email_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() AND verified = 0");
        $stmt->bind_param("ss", $new_email, $otp);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or expired OTP. Please try again."]);
            $stmt->close();
            $conn->close();
            exit();
        }
        $stmt->close();

        // Mark OTP as verified
        $upd = $conn->prepare("UPDATE email_verifications SET verified = 1 WHERE email = ?");
        $upd->bind_param("s", $new_email);
        $upd->execute();
        $upd->close();

        // Now save the full profile with new email
        $result = saveProfile($conn, $user_id, $f);
        $conn->close();

        if (isset($result['error'])) { http_response_code(400); }
        echo json_encode($result);
        exit();
    }

    http_response_code(400);
    echo json_encode(["error" => "Invalid action"]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>