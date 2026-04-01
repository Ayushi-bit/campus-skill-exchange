<?php
include "config/database.php";

$result = $conn->query("SELECT * FROM users");

while($row = $result->fetch_assoc()){
    echo $row['name'] . "<br>";
}
?>