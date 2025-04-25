<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ob_start();

// Create connection
$conn = new mysqli('localhost', 'root', '', 'caras_db');

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log(print_r($_POST, true));

    $action = $_POST['action'] ?? null;

    if ($action === 'add') {

    $ingredientName = $_POST['ingredient-name'] ?? null;
    $ingredientCategory = $_POST['ingredient-category'] ?? null;
    $ingredientUnit = $_POST['ingredient-unit'] ?? null;
    $lowStockThreshold = $_POST['low-stock-threshold'] ?? null;
    $mediumStockThreshold = $_POST['medium-stock-threshold'] ?? null;
    $reorderPoint = $_POST['reorder-point'] ?? null;
    $totalQuantity = $_POST['total-quantity'] ?? null;

    if (empty($ingredientName) || empty($ingredientCategory) || empty($ingredientUnit) 
    || !is_numeric($lowStockThreshold) || !is_numeric($mediumStockThreshold) || !is_numeric($reorderPoint)
    || !is_numeric($totalQuantity)) {

        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit; // Exit after sending the error response
    }

    $sql = "INSERT INTO ingredient (
    ingredientName, 
    ingCategory, 
    ingUnit, 
    lowStock, 
    mediumStock, 
    reorderPoint, 
    totalQuantity) 
    VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {

        echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("siiiiii", 
    $ingredientName, 
    $ingredientCategory, 
    $ingredientUnit, 
    $lowStockThreshold, 
    $mediumStockThreshold, 
    $reorderPoint, 
    $totalQuantity);

    if ($stmt->execute()) {

        echo json_encode(['status' => 'success', 'message' => 'Ingredient added successfully.']);
    } else {

        echo json_encode(['status' => 'error', 'message' => 'Error adding ingredient.']);
    }
    $stmt->close();

    } elseif ($action === 'update') {

        $ingredientID = $_POST['ingredient-id'] ?? null;
        $updateIngredientName = $_POST['update-ingredient-name'] ?? null;
        $updateCategory = $_POST['update-category'] ?? null;
        $updateUnit = $_POST['update-unit'] ?? null;
        $updateLST = $_POST['update-lowStockThreshold'] ?? null;
        $updateMST = $_POST['update-mediumStockThreshold'] ?? null;
        $updateReorderPoint = $_POST['update-reorderPoint'] ?? null;

        if (empty($ingredientID) || empty($updateIngredientName) || empty($updateCategory) || empty($updateUnit) 
        || !is_numeric($updateLST) || !is_numeric($updateMST) || !is_numeric($updateReorderPoint)) {
    
            echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
            exit; // Exit after sending the error response
        }

        $sql = "UPDATE ingredient 
        SET ingredientName = ?, 
            ingCategory = ?, 
            ingUnit = ?, 
            lowStock = ?, 
            mediumStock = ?, 
            reorderPoint = ? 
        WHERE ingredientID = ?";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }

        $stmt->bind_param("siiiiii",
        $updateIngredientName,
        $updateCategory,
        $updateUnit,
        $updateLST,
        $updateMST,
        $updateReorderPoint,
        $ingredientID);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Ingredient updated successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error updating ingredient.']);
        }
        $stmt->close();

    } elseif ($action === 'delete') {

        $delIngredientID = $_POST['ingredient-id'] ?? null;

        if(empty($delIngredientID)){
            echo json_encode(['status' => 'error', 'message' => 'Ingredient ID cannot be empty.']);
            exit;
        }

        $sql = "DELETE FROM ingredient WHERE ingredientID=?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("i", $delIngredientID);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Ingredient deleted successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error deleting ingredient.']);
        }
        $stmt->close();
        
    } elseif ($action === 'update_quantity') {
        // New action to update the total quantity
        $ingredientID = $_POST['ingredient-id'] ?? null;
        $newQuantity = $_POST['new-quantity'] ?? null;

        if (empty($ingredientID) || !is_numeric($newQuantity)) {
            echo json_encode(['status' => 'error', 'message' => 'Ingredient ID and new quantity are required.']);
            exit;
        }

        $sql = "UPDATE ingredient SET totalQuantity = ? WHERE ingredientID = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }

        $stmt->bind_param("ii", $newQuantity, $ingredientID);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Ingredient quantity updated successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error updating ingredient quantity.']);
        }
        $stmt->close();
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

$conn->close();
?>