<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create connection
$conn = new mysqli('localhost', 'root', '', 'caras_db');

// Check connection
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => "Connection failed: " . $conn->connect_error]));
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        die(json_encode(['status' => 'error', 'message' => 'Invalid JSON data']));
    }

    if (isset($data['stockData']) && is_array($data['stockData'])) {
        $response = [];
        $errors = [];

        foreach ($data['stockData'] as $stockItem) {
            // Validate the required fields
            if (!isset(
            $stockItem['ingredientID'], 
            $stockItem['originalQuantity'], 
            $stockItem['quantityRemaining'], 
            $stockItem['stockInDate'], 
            $stockItem['expirationDate'])) 
            {
                $errors[] = "Missing required fields for ingredient ID: " . $stockItem['ingredientID'];
                continue;
            }

            // Determine if it's a stock-in or stock-out operation
            $isStockOut = $stockItem['stockStatus'] === 'OUT';

            if ($isStockOut) {
                // Handle stock-out logic
                $stmt = $conn->prepare("UPDATE stock SET quantityRemaining = quantityRemaining - ?, stockStatus = ? WHERE ingredient = ?");
                $stmt->bind_param(
                    "isi",
                    $stockItem['originalQuantity'],
                    $stockItem['stockStatus'],
                    $stockItem['ingredientID']
                );
            } else {
                // Handle stock-in logic
                $stmt = $conn->prepare("INSERT INTO stock (ingredient, originalQuantity, quantityRemaining, stockIn_date, expirationDate, expirationAlert, stockStatus) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param(
                    "iiissis",
                    $stockItem['ingredientID'],
                    $stockItem['originalQuantity'],
                    $stockItem['quantityRemaining'],
                    $stockItem['stockInDate'],
                    $stockItem['expirationDate'],
                    $stockItem['expirationAlertTH'],
                    $stockItem['stockStatus']
                );
            }

            // Execute the statement
            if ($stmt->execute()) {
                $response[] = "Stock entry for ingredient ID " . $stockItem['ingredientID'] . " processed successfully.";
            } else {
                $errors[] = "Error processing stock entry for ingredient ID " . $stockItem['ingredientID'] . ": " . $stmt->error;
            }

            $stmt->close();
        }

        if (empty($errors)) {
            echo json_encode(['status' => 'success', 'messages' => $response]);
        } else {
            echo json_encode(['status' => 'error', 'messages' => $errors]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data format.']);
    }
}

$conn->close();
?>