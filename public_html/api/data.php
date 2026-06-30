<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$dataDir = __DIR__ . '/../data/';

function readJson($file) {
    global $dataDir;
    $path = $dataDir . $file . '.json';
    if (!file_exists($path)) return [];
    $content = file_get_contents($path);
    return json_decode($content, true) ?: [];
}

function writeJson($file, $data) {
    global $dataDir;
    $path = $dataDir . $file . '.json';
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? '';

if ($method === 'GET') {
    $data = readJson($table);
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'save';

    if ($action === 'save') {
        writeJson($table, $input['data'] ?? []);
        echo json_encode(['success' => true, 'message' => 'Kaydedildi']);
    } elseif ($action === 'add') {
        $data = readJson($table);
        $data[] = $input['data'];
        writeJson($table, $data);
        echo json_encode(['success' => true, 'message' => 'Eklendi']);
    } elseif ($action === 'delete') {
        $data = readJson($table);
        $id = $input['id'] ?? 0;
        $data = array_filter($data, function($item) use ($id) {
            return ($item['id'] ?? 0) !== $id;
        });
        writeJson($table, array_values($data));
        echo json_encode(['success' => true, 'message' => 'Silindi']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Bilinmeyen aksiyon']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Geçersiz istek']);
?>