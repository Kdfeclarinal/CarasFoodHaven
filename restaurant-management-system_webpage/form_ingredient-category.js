/*============================================================*/

function addNewIngredientCategory() {
    if (!formValidity('ingredient-category-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Gather data from the form fields
    const ingredientCategoryID = document.querySelector('#ingredient-category-table tbody').rows.length + 1
    const ingredientCategoryName = document.getElementById("ingredient-category-name").value;

    // Check for duplicate name in the table
    const table = document.getElementById("ingredient-category-table");
    const existingRows = table.querySelectorAll("tbody tr");

    for (const row of existingRows) {
        const rowData = JSON.parse(row.getAttribute("data-ingredient-category"));
        const existingName = rowData.name.trim();

        if (existingName.toLowerCase() === ingredientCategoryName.toLowerCase()) {
            showNotification(`Ingredient Category: '${ingredientCategoryName}' already exists!`);
            return;
        }
    }

    const addCategoryData = new FormData();
    addCategoryData.append('ingredient-category-name', ingredientCategoryName);
    addCategoryData.append('action', 'add');

    fetch('handlers/ingredient_category_handler.php', {
        method: 'POST',
        body: addCategoryData
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        if (data.status === 'success'){

    // Create a new row for the ingredient category table
    const newRow = document.createElement("tr");

    // Store data as an object and attach it as a data attribute
    const ingredientCategoryData = {
        id: ingredientCategoryID,
        name: ingredientCategoryName
    };
    newRow.setAttribute("data-ingredient-category", JSON.stringify(ingredientCategoryData));

    // Populate the row's cells
    newRow.innerHTML = `
        <td>${ingredientCategoryID}</td>
        <td>${ingredientCategoryName}</td>
    `;

    // Add click event listener to the new row
    newRow.addEventListener('click', function () {
        ingredientCategory_tableRowClicked('data-ingredient-category', newRow);
        highlightClickedTableRow('ingredient-category-table', newRow);
    });

    // Append the new row to the table body
    table.querySelector("tbody").appendChild(newRow);

    // Add the new category to the combo box
    const ingredientCategoryComboBox = document.getElementById("ingredient-category-combobox");
    ingredientCategoryComboBox.add(new Option(ingredientCategoryName, ingredientCategoryID));

    // Clear the form fields
    clearFormFields('ingredient-category-table', 'ingredient-category-form');

    // Show a success notification
    showNotification(`Ingredient Category: '${ingredientCategoryName}' added successfully!`);

}
})
.catch(error => {
    console.error('Error:', error);
    showNotification('An error occured while adding the ingredient unit.');
});

}

/*============================================================*/

function ingredientCategory_tableRowClicked(dataRow, row) {
    // Access the data stored in the row's custom attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Set the form fields with the retrieved data
    document.getElementById("ingredient-category-id").value = rowData.id;
    document.getElementById("ingredient-category-name").value = rowData.name;
}

/*============================================================*/

function updateSelectedIngredientCategory() {
    // Find the currently selected row
    const selectedRow = document.querySelector("#ingredient-category-table .clickedTableRow");

    // Check if a row is selected
    if (!selectedRow) {
        showNotification(`Select a row to update from the table.`);
        return;
    }

    // Validate form input
    if (!formValidity('ingredient-category-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values from the input fields
    const selectedRowData = JSON.parse(selectedRow.getAttribute('data-ingredient-category'));
    const ingredientCategoryID = selectedRowData.id;
    const ingredientCategoryName = document.getElementById("ingredient-category-name").value;

    const updateCategoryData = new FormData();
    updateCategoryData.append('category-id', ingredientCategoryID);
    updateCategoryData.append('update-category-name', ingredientCategoryName);
    updateCategoryData.append('action', 'update');

    fetch('handlers/ingredient_category_handler.php', {
        method:'POST',
        body: updateCategoryData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        try {
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        if (data.status === 'success'){  

    // Create an object to store the ingredient category data
    const ingredientCategoryData = {
        id: ingredientCategoryID,
        name: ingredientCategoryName
    };

    // Update the data-ingredient-category attribute with the new data
    selectedRow.setAttribute("data-ingredient-category", JSON.stringify(ingredientCategoryData));

    // Update the displayed cell contents
    const cells = selectedRow.querySelectorAll("td");
    if (cells.length >= 2) {
        cells[0].textContent = ingredientCategoryID; // Update the ID cell
        cells[1].textContent = ingredientCategoryName;    // Update the name cell
        showNotification(`Ingredient Category: '${ingredientCategoryName}' updated successfully!`);
    }

    // Highlight the updated row for visual feedback
    animateRowHighlight(selectedRow);

    // Repopulate the combo box from the table
    repopulateComboBoxFromTable("ingredient-category-table", "data-ingredient-category", "ingredient-category-combobox");

    // Clear the input fields of the form
    clearFormFields('ingredient-category-table', 'ingredient-category-form');

} else {
    throw new Error(data.message || 'Unknown error occurred.');
    }
} catch (e) {
console.error('Invalid JSON response:', text);
throw new Error('Failed to parse JSON response.');
}
})
.catch(error => {
console.error('Error:', error);
showNotification('An error occurred while updating the ingredient category.');
});
}

/*============================================================*/

function deleteSelectedIngredientCategory(tableID, dataName) {
    // Get the table by ID
    const table = document.getElementById(tableID);

    // Find the currently selected row
    const selectedRow = table.querySelector(".clickedTableRow");

    // Check if a row is selected
    if (!selectedRow) {
        showNotification(`Select a row to delete from the table.`);
        return;
    }

    // Grab the selected row's data attribute and its ID
    const selectedRowData = JSON.parse(selectedRow.getAttribute(`data-${dataName}`));
    const selectedRowID = parseInt(selectedRowData.id); // Ensure ID is a number

    const deleteCategoryData = new FormData();
    deleteCategoryData.append('category-id', selectedRowID);
    deleteCategoryData.append('action', 'delete');

    fetch('handlers/ingredient_category_handler.php', {
       method: 'POST',
       body: deleteCategoryData 
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        try {
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        if (data.status === 'success'){

    // Remove the selected row
    selectedRow.remove();
    clearFormFields(tableID, `${tableID.replace('-table', '-form')}`);

    // Show notification for deletion
    showNotification(`Record ID: '${selectedRowID}' deleted successfully!`);
    
    repopulateComboBoxFromTable("ingredient-category-table", "data-ingredient-category", "ingredient-category-combobox");
} else {
    throw new Error(data.message || 'Unknown error occurred.');
    }
} catch (e) {
console.error('Invalid JSON response:', text);
throw new Error('Failed to parse JSON response.');
}
})
.catch(error => {
console.error('Error:', error);
showNotification('An error occurred while deleting the ingredient category.');
});
}

/*============================================================*/