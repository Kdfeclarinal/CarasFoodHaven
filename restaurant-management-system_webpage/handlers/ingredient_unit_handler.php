<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create connection
$conn = new mysqli('localhost', 'root', '', 'caras_db');

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log(print_r($_POST, true));

    $action = $_POST['action'] ?? null;

    if ($action === 'add') {

        $unitName = $_POST['ingredient-unit-name'] ?? null;

        if (empty($unitName)) {
            echo json_encode(['status' => 'error', 'message' => 'Ingredient unit name cannot be empty.']);
            exit; // Exit after sending the error response
        }
        // Add new ingredient unit
        $sql = "INSERT INTO ingredient_unit (unitName) VALUES (?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("s", $unitName);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Ingredient unit added successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error adding ingredient unit.']);
        }
        $stmt->close();
        
    } elseif ($action === 'update' ) {
        $unitID = $_POST['unit-id'] ?? null;
        $updatename = $_POST['update-unit-name'] ?? null;

        // Validate input
        if (empty($unitID) || empty($updatename)) {
            echo json_encode(['status' => 'error', 'message' => 'Updated ingredient unit name cannot be empty.']);
            exit; // Exit after sending the error response
        }
            // Update existing ingredient unit
            $sql = "UPDATE ingredient_unit SET unitName=? WHERE ingredientUnitID=?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
                exit;
            }
            $stmt->bind_param("si", $updatename, $unitID); 
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Ingredient unit updated successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error updating ingredient unit.']);
            }
            $stmt->close();
    } elseif ($action === 'delete') {
        
        $delUnitID = $_POST['unit-id'] ?? null;

        if(empty($delUnitID)){
           echo json_encode(['status' => 'error', 'message' => 'Unit ID cannot be empty.']);
           exit;
        }

            $sql = "DELETE FROM ingredient_unit WHERE ingredientUnitID=?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
                exit;
            }
            $stmt->bind_param("i", $delUnitID);
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Ingredient unit deleted successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error deleting ingredient unit.']);
            }
            $stmt->close();
    }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing parameters for update.']);
    }
$conn->close();
?>