


<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

$conn = getConnection();

$method = $_SERVER['REQUEST_METHOD'];


// =======================
// ADD PROJECT
// =======================
if ($method === "POST") {

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    echo json_encode(["error"=>"Invalid JSON data"]);
    exit();
}

$title = $data['title'] ?? '';
$description = $data['description'] ?? '';
$domain_id = $data['domain_id'] ?? 0;
$experience_level = $data['experience_level'] ?? '';
$posted_by = $data['posted_by'] ?? 0;

$stmt = $conn->prepare("
INSERT INTO projects
(title,description,domain_id,posted_by,experience_level)
VALUES (?,?,?,?,?)
");

$stmt->bind_param(
"ssiss",
$title,
$description,
$domain_id,
$posted_by,
$experience_level
);

if ($stmt->execute()) {
echo json_encode(["message"=>"Project added"]);
} else {
echo json_encode(["error"=>$conn->error]);
}

exit();
}


// =======================
// GET / SEARCH PROJECT
// =======================
if ($method === "GET") {

$skill = $_GET['skill'] ?? null;

if ($skill) {

$stmt = $conn->prepare("
SELECT p.*, d.name AS domain
FROM projects p
JOIN domains d ON p.domain_id = d.id
JOIN project_skills ps ON p.id = ps.project_id
JOIN skills s ON ps.skill_id = s.id
WHERE s.name LIKE ?
");

$search="%$skill%";
$stmt->bind_param("s",$search);

$stmt->execute();
$result=$stmt->get_result();

}else{

$result=$conn->query("
SELECT p.*, d.name AS domain
FROM projects p
JOIN domains d ON p.domain_id=d.id
ORDER BY created_at DESC
");

}

$projects=[];

while($row=$result->fetch_assoc()){
$projects[]=$row;
}

echo json_encode($projects);
}
?>