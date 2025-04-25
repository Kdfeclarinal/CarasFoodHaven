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

        $categoryName = $_POST['menu-category-name'] ?? null;

        if (empty($categoryName)) {
            echo json_encode(['status' => 'error', 'message' => 'Menu category name cannot be empty.']);
            exit; // Exit after sending error response
        }
        // Add new Menu unit
        $sql = "INSERT INTO menu_category (categoryName) VALUES (?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("s", $categoryName);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Menu category added successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error adding Menu category.']);
        }
        $stmt->close();
    
    }   elseif ($action === 'update') {

        $categoryID = $_POST['category-id'] ?? null;
        $updatename = $_POST['update-category-name'] ?? null;

        if (empty($categoryID) || empty($updatename)) {
            echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
            exit; // Exit after sending the error response
        }

            $sql = "UPDATE menu_category SET categoryName=? WHERE menuCategoryID=?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
                exit;
            }
            $stmt->bind_param("si", $updatename, $categoryID);
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Ingredient category updated successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error updating ingredient category.']);
            }
            $stmt->close();
    }  elseif ($action === 'delete') {
        
        $delCategoryID = $_POST['category-id'] ?? null;

        if(empty($delCategoryID)){
            echo json_encode(['status' => 'error', 'message' => 'Category ID cannot be empty.']);
            exit;
        }

        $sql = "DELETE FROM menu_category WHERE menuCategoryID=?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("i", $delCategoryID);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Ingredient category deleted successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error deleting ingredient category.']);
        }
        $stmt->close();
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters for update.']);
}
$conn->close();
?>