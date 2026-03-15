<?php
// Load .env values
$env = parse_ini_file(__DIR__ . '/../.env');

$client_id    = $env['CLIENT_ID'];
$redirect_uri = "http://localhost/backend/oauth/google_callback.php";

$params = http_build_query([
    'client_id'     => $client_id,
    'redirect_uri'  => $redirect_uri,
    'response_type' => 'code',
    'scope'         => 'openid email profile',
    'access_type'   => 'online',
    'prompt'        => 'select_account',
]);

header("Location: https://accounts.google.com/o/oauth2/v2/auth?" . $params);
exit();
?>