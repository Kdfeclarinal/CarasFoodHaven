/*============================================================*/

function addIngredientToList() {
    // Get the selected option from the combobox
    const ingredientComboBox = document.getElementById("ingredient-name-combobox");
    const selectedIndex = ingredientComboBox.selectedIndex;

    if (!ingredientComboBox.checkValidity()) { 
        ingredientComboBox.reportValidity();
        showNotification(`Select an ingredient to add to the recipe.`);
        return; // Exit if no ingredient is selected
    }

    // Get the selected ingredient ID from the value of the selected option
    const selectedIngredientID = parseInt(ingredientComboBox.options[selectedIndex].value);

    // Get the table and search for the row where the ingredient ID matches
    const table = document.getElementById('ingredient-table');
    const rows = table.querySelectorAll("tbody tr");
    let selectedRow = null;

    // Find the matching row by comparing the ingredient ID
    rows.forEach(row => {
        const ingredientData = JSON.parse(row.getAttribute('data-ingredient')); // Parse the data-ingredient attribute
        if (ingredientData.id === selectedIngredientID) {
            selectedRow = row;
        }
    });

    if (!selectedRow) {
        showNotification(`Ingredient not found in the Ingredient Table.`);
        return;
    }

    // Check if the ingredient is already in the "ingredient-list-table"
    const ingredientListTableBody = document.getElementById("ingredient-list-table-body");
    const ingredientListRows = ingredientListTableBody.querySelectorAll("tr");

    // Use a flag to determine if the ingredient is already added
    let isIngredientAlreadyAdded = false;

    for (const row of ingredientListRows) {
        const existingIngredientID = parseInt(row.getAttribute('data-ingredient-id')); // Compare by ID
        if (existingIngredientID === selectedIngredientID) {
            isIngredientAlreadyAdded = true; // Set the flag to true if a match is found
            break; // Exit the loop if ingredient is found
        }
    }

    if (isIngredientAlreadyAdded) {
        showNotification(`This ingredient is already in the list.`);
        return; // Exit if the ingredient is already in the table
    }

    // Add a new row to the "ingredient-list-table"
    const newRow = document.createElement("tr");

    // Create cells for the new row
    const mainIngredientCell = document.createElement("td");
    const qtyCell = document.createElement("td");
    const ingredientCell = document.createElement("td");

    // Create the checkbox for the main ingredient (1st column)
    const mainIngredientCheckbox = document.createElement("input");
    mainIngredientCheckbox.type = "checkbox";
    mainIngredientCheckbox.name = "main-ingredient-checkbox";
    mainIngredientCell.appendChild(mainIngredientCheckbox);

    // Create the input for the quantity (2nd column)
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.placeholder = "Qty";
    qtyInput.min = "1";  // Ensure no negative values
    qtyInput.required = true; // Mark as required
    qtyCell.appendChild(qtyInput);

    // Use grabSpecificDataFromID to get the unit
    const ingredientUnit = grabSpecificDataFromID('ingredient', selectedIngredientID, 'unit');

    // Add the unit below the quantity input
    const unitSpan = document.createElement("span");
    unitSpan.textContent = ingredientUnit;
    qtyCell.appendChild(unitSpan);

    // Set the 3rd column with just the [ID] INGREDIENT
    const formattedIngredient = document.createElement("span");
    formattedIngredient.classList.add("formatted-ingredient");
    formattedIngredient.textContent = `[${selectedIngredientID}] ${grabSpecificDataFromID('ingredient', selectedIngredientID, 'name')}`;

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Remove";
    deleteButton.classList.add("deleteButtons");
    deleteButton.onclick = function() {
        ingredientListTableBody.removeChild(newRow);  // Remove the row when "delete" is clicked
    };

    // Append the formatted ingredient and delete button to the ingredient cell
    ingredientCell.appendChild(formattedIngredient);
    ingredientCell.appendChild(deleteButton);

    // Append the cells to the new row
    newRow.appendChild(mainIngredientCell);
    newRow.appendChild(qtyCell);
    newRow.appendChild(ingredientCell);

    // Set the data-ingredient-id attribute for the new row for later checks
    newRow.setAttribute('data-ingredient-id', selectedIngredientID);

    // Append the new row to the ingredient list table body
    ingredientListTableBody.appendChild(newRow);

    // Reset the combobox to its default state
    ingredientComboBox.selectedIndex = 0;
}

/*============================================================*/

function addNewMenuItem() {
    if (!formValidity('menu-item-form', ['ingredient-name-combobox'])) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Gather data from the form fields
    const menuItemId = document.querySelector('#menu-item-table tbody').rows.length + 1;
    const menuItemImage = document.getElementById('preview-image').src;
    const menuItemName = document.getElementById('menu-item-name').value;
    const menuItemAssignedCategory_ComboBox = document.getElementById("menu-category-combobox");
    const menuItemAssignedCategory = menuItemAssignedCategory_ComboBox.options[menuItemAssignedCategory_ComboBox.selectedIndex].textContent;
    let menuItemPrice = document.getElementById('menu-item-price').value;
    let menuItemCost = document.getElementById('menu-item-cost').value; // Gather cost from the form
    const menuItemDescription = document.getElementById('menu-item-description').value;

    // Check for duplicate name in the table
    const table = document.getElementById("menu-item-table");
    const existingRows = table.querySelectorAll("tbody tr");

    for (const row of existingRows) {
        const rowData = JSON.parse(row.getAttribute("data-menu-item"));
        const existingName = rowData.name.trim();

        if (existingName.toLowerCase() === menuItemName.toLowerCase()) {
            showNotification(`Menu Item Name: '${menuItemName}' already exists!`);
            return;
        }
    }

    // Validate price input
    menuItemPrice = parseFloat(menuItemPrice);
    if (isNaN(menuItemPrice) || menuItemPrice <= 0) {
        document.getElementById('menu-item-price').reportValidity();
        showNotification(`Invalid input for Menu Item Price.`);
        return;
    }
    menuItemPrice = `Php ${menuItemPrice.toFixed(2)}`;

    // Validate cost input
    menuItemCost = parseFloat(menuItemCost);
    if (isNaN(menuItemCost) || menuItemCost <= 0) {
        menuItemCost = null; // Set cost to null if invalid
    } else {
        menuItemCost = `Php ${menuItemCost.toFixed(2)}`; // Format cost
    }

    // Gather ingredients from the ingredient list table
    const ingredientsTable = document.getElementById('ingredient-list-table-body');
    const ingredientsData = [];
    if (ingredientsTable.rows.length === 0) {
        document.getElementById('ingredient-list-table-body').focus();
        showNotification(`At least one ingredient is required in the recipe. Please add ingredients.`);
        return;
    }

    let mainIngredientSelected = false;
    let invalidQuantityInputField = null; // To track invalid quantity input field

    for (let row of ingredientsTable.rows) {
        const mainIngredientCheckbox = row.cells[0].querySelector('input[type="checkbox"]');
        const quantityInput = row.cells[1].querySelector('input');
        const quantityConsumed = quantityInput.value;
        const ingredientID = parseInt(row.cells[2].innerHTML.match(/\[(.*?)\]/)[1]);

        if (!quantityConsumed || isNaN(parseFloat(quantityConsumed)) || parseFloat(quantityConsumed) <= 0) {
            invalidQuantityInputField = quantityInput; // Track the invalid input field
            showNotification(`Invalid quantity for Ingredient ID: '${ingredientID}'`);
            return; // Continue checking other rows
        }

        if (mainIngredientCheckbox.checked) {
            mainIngredientSelected = true;
        }

        ingredientsData.push({
            ingredientID,
            quantityConsumed: parseFloat(quantityConsumed),
            isMainIngredient: mainIngredientCheckbox.checked
        });
    }

    if (invalidQuantityInputField) {
        invalidQuantityInputField.reportValidity(); // Focus on the invalid quantity input field
        return;
    }

    if (!mainIngredientSelected) {
        // Focus on the first checkbox if none are selected
        const firstCheckbox = ingredientsTable.querySelector('input[type="checkbox"]');
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
        showNotification(`Select at least ONE KEY ingredient for this Menu Item.`);
        return;
    }

    // Create a new row for the menu item table
    const newRow = document.createElement('tr');

    // Add the data to the table row
    newRow.innerHTML = `
      <td><img src="${menuItemImage}" alt="${menuItemName}" id="menu-item-img-column"></td>
      <td>[${menuItemId}] ${menuItemName}</td>
      <td>${menuItemAssignedCategory}</td>
      <td>${menuItemPrice}</td>
      <td>${menuItemCost !== null ? menuItemCost : ''}</td> <!-- Add cost to the row, show '' if null -->
    `;

    // Store all data as a data attribute for the row
    newRow.setAttribute('data-menu-item', JSON.stringify({
        imageSrc: menuItemImage,
        id: menuItemId,
        name: menuItemName,
        category: menuItemAssignedCategory,
        price: menuItemPrice,
        cost: menuItemCost, // Store cost
        description: menuItemDescription,
        ingredients: ingredientsData
    }));

    // Add click event listener to the new row
    newRow.addEventListener('click', function () {
        menuItem_tableRowClicked('data-menu-item', newRow);
        highlightClickedTableRow('menu-item-table', newRow);
    });

    // Append the new row to the menu item table
    table.querySelector("tbody").appendChild(newRow);

    // Clear the input fields of the form
    clearFormFields('menu-item-table', 'menu-item-form');

    showNotification(`Menu Item: '${menuItemName}' added successfully!`);
}

/*============================================================*/

function menuItem_tableRowClicked(dataRow, row) {
    // Access the data stored in the row's custom attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Populate the form fields with the data
    document.getElementById('menu-item-id').value = rowData.id;
    document.getElementById('menu-item-name').value = rowData.name;

    const categoryComboBox = document.getElementById('menu-category-combobox');
    for (let i = 0; i < categoryComboBox.options.length; i++) {
        if (categoryComboBox.options[i].textContent === rowData.category) {
            categoryComboBox.selectedIndex = i;
            break;
        }
    }

    // Remove "Php " from the price to get the numeric value
    const rawPrice = rowData.price.replace("Php ", "");
    document.getElementById('menu-item-price').value = rawPrice;

    // Handle cost: if null, set the input to an empty string; otherwise, remove "Php " and set the value
    const rawCost = rowData.cost ? rowData.cost.replace("Php ", "") : ''; // Check if cost is null
    document.getElementById('menu-item-cost').value = rawCost; // Populate the cost input

    document.getElementById('menu-item-description').value = rowData.description;

    // Set the image source in the preview image element
    const previewImage = document.getElementById('preview-image');
    previewImage.src = rowData.imageSrc;

    // Clear the existing ingredient list table
    const ingredientListTableBody = document.getElementById('ingredient-list-table-body');
    ingredientListTableBody.innerHTML = '';

    // Repopulate the ingredient list table with the data
    rowData.ingredients.forEach(ingredient => {
        // Add a new row for the ingredient
        const newRow = document.createElement('tr');

        // Create cells for the new row
        const mainIngredientCell = document.createElement('td');
        const qtyCell = document.createElement('td');
        const ingredientCell = document.createElement('td');

        // Create the checkbox for marking the main ingredient (1st column)
        const mainIngredientCheckbox = document.createElement('input');
        mainIngredientCheckbox.type = 'checkbox';
        mainIngredientCheckbox.name = 'main-ingredient-checkbox';
        mainIngredientCheckbox.checked = ingredient.isMainIngredient; // Check if it's the main ingredient
        mainIngredientCell.appendChild(mainIngredientCheckbox);

        // Create the input for the quantity (2nd column)
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = ingredient.quantityConsumed;
        qtyInput.min = '1';  // Ensure no negative values
        qtyInput.required = true;
        qtyCell.appendChild(qtyInput);

        // Use grabSpecificDataFromID to get the unit
        const ingredientUnit = grabSpecificDataFromID('ingredient', ingredient.ingredientID, 'unit');

        // Add the unit below the quantity input
        const unitSpan = document.createElement("span");
        unitSpan.textContent = ingredientUnit;
        qtyCell.appendChild(document.createElement("br")); // Line break for better layout
        qtyCell.appendChild(unitSpan);

        // Set the 3rd column with just the [ID] INGREDIENT
        const formattedIngredient = document.createElement('span');
        formattedIngredient.classList.add('formatted-ingredient');
        formattedIngredient.textContent = `[${ingredient.ingredientID}] ${grabSpecificDataFromID('ingredient', ingredient.ingredientID, 'name')}`;

        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.classList.add('deleteButtons');
        deleteButton.onclick = function () {
            ingredientListTableBody.removeChild(newRow);  // Remove the row when "delete" is clicked
        };

        // Append the formatted ingredient and delete button to the ingredient cell
        ingredientCell.appendChild(formattedIngredient);
        ingredientCell.appendChild(deleteButton);

        // Append the cells to the new row
        newRow.appendChild(mainIngredientCell);
        newRow.appendChild(qtyCell);
        newRow.appendChild(ingredientCell);

        // Append the new row to the ingredient list table body
        ingredientListTableBody.appendChild(newRow);
    });
}

/*============================================================*/

function updateSelectedMenuItem() {
    // Get the selected row with the class "clickedTableRow"
    const selectedRow = document.querySelector('#menu-item-table .clickedTableRow');
    
    if (!selectedRow) {
        showNotification(`Select a row to update from the table.`);
        return;
    }
    
    if (!formValidity('menu-item-form', ['ingredient-name-combobox'])) {
        showNotification(`Fill required fields with valid input.`);
        return;
    }

    // Gather updated data from the form fields
    const selectedRowData = JSON.parse(selectedRow.getAttribute('data-menu-item'));
    const updatedMenuItemId = selectedRowData.id;
    
    const updatedMenuItemImage = document.getElementById('preview-image').src;
    const updatedMenuItemName = document.getElementById('menu-item-name').value;
    const updatedMenuItemAssignedCategory_ComboBox = document.getElementById("menu-category-combobox");
    const updatedMenuItemAssignedCategory = updatedMenuItemAssignedCategory_ComboBox.options[updatedMenuItemAssignedCategory_ComboBox.selectedIndex].textContent;
    let updatedMenuItemPrice = document.getElementById('menu-item-price').value;
    let updatedMenuItemCost = document.getElementById('menu-item-cost').value; // Gather cost from the form
    const updatedMenuItemDescription = document.getElementById('menu-item-description').value;

    // Validate price input
    updatedMenuItemPrice = parseFloat(updatedMenuItemPrice); // Convert to a number (float)
    
    if (isNaN(updatedMenuItemPrice) || updatedMenuItemPrice <= 0) {
        document.getElementById('menu-item-price').reportValidity();
        showNotification(`Invalid input for Menu Item Price.`);
        return; // Exit the function if the price is invalid
    }

    // Format the price to always show two decimal places and add "Php " prefix
    updatedMenuItemPrice = `Php ${updatedMenuItemPrice.toFixed(2)}`;

    // Validate cost input
    updatedMenuItemCost = parseFloat(updatedMenuItemCost); // Convert to a number (float)
    
    if (isNaN(updatedMenuItemCost) || updatedMenuItemCost <= 0) {
        updatedMenuItemCost = null; // Set cost to null if invalid
    } else {
        // Format the cost to always show two decimal places and add "Php " prefix
        updatedMenuItemCost = `Php ${updatedMenuItemCost.toFixed(2)}`;
    }

    // Gather updated ingredients from the ingredient list table
    const ingredientsTable = document.getElementById('ingredient-list-table-body');
    const updatedIngredientsData = [];

    // Check if the ingredient list is empty
    if (ingredientsTable.rows.length === 0) {
        document.getElementById('ingredient-list-table-body').focus();
        showNotification(`At least one ingredient is required in the recipe. Please add ingredients.`);
        return; // Exit the function if no ingredients are provided
    }

    let mainIngredientSelected = false;
    let invalidQuantityInputField = null; // To track invalid quantity input field
    
    for (let row of ingredientsTable.rows) {
        const mainIngredientCheckbox = row.cells[0].querySelector('input[type="checkbox"]');
        const quantityInput = row.cells[1].querySelector('input');
        const quantityConsumed = quantityInput.value;
        const ingredientID = parseInt(row.cells[2].innerHTML.match(/\[(.*?)\]/)[1]);

        // Check for empty or invalid inputs
        if (!quantityConsumed || isNaN(parseFloat(quantityConsumed)) || parseFloat(quantityConsumed) <= 0) {
            invalidQuantityInputField = quantityInput; // Track the invalid input field
            showNotification(`Invalid quantity for Ingredient ID: '${ingredientID}'`);
            return; // Exit the function if the quantity is invalid
        }

        // Check if the main ingredient checkbox is checked
        if (mainIngredientCheckbox.checked) {
            mainIngredientSelected = true;
        }

        // Store the updated ingredient data (including unit)
        updatedIngredientsData.push({
            ingredientID,
            quantityConsumed: parseFloat(quantityConsumed),  // Ensure it's a number
            isMainIngredient: mainIngredientCheckbox.checked  // Track if it's the main ingredient
        });
    }

    if (invalidQuantityInputField) {
        invalidQuantityInputField.reportValidity(); // Focus on the invalid quantity input field
        return;
    }

    if (!mainIngredientSelected) {
        // Focus on the first checkbox if none are selected
        const firstCheckbox = ingredientsTable.querySelector('input[type="checkbox"]');
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
        showNotification(`Select at least ONE KEY ingredient for this Menu Item.`);
        return;
    }

    // Update the row's HTML with the new values
    selectedRow.innerHTML = `
      <td><img src="${updatedMenuItemImage}" alt="${updatedMenuItemName}" id="menu-item-img-column"></td>
      <td>[${updatedMenuItemId}] ${updatedMenuItemName}</td>
      <td>${updatedMenuItemAssignedCategory}</td>
      <td>${updatedMenuItemPrice}</td>
      <td>${updatedMenuItemCost !== null ? updatedMenuItemCost : ''}</td> <!-- Add cost to the row, show '' if null -->
    `;

    // Update the data attribute for the selected row
    selectedRow.setAttribute('data-menu-item', JSON.stringify({
        imageSrc: updatedMenuItemImage,
        id: updatedMenuItemId,
        name: updatedMenuItemName,
        category: updatedMenuItemAssignedCategory,
        price: updatedMenuItemPrice,
        cost: updatedMenuItemCost, // Store cost
        description: updatedMenuItemDescription,
        ingredients: updatedIngredientsData  // Store the updated ingredient data including unit and main ingredient
    }));

    // Highlight the updated row for visual feedback
    animateRowHighlight(selectedRow);

    // Clear the input fields of the form
    clearFormFields('menu-item-table', 'menu-item-form');

    showNotification(`Menu Item: '${updatedMenuItemName}' updated successfully!`);
}

/*============================================================*/

function deleteSelectedMenuItem(tableID, dataName) {
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

    // Remove the selected row
    selectedRow.remove();
    clearFormFields(tableID, `${tableID.replace('-table', '-form')}`);

    // Show notification for deletion
    showNotification(`Record ID: '${selectedRowID}' deleted successfully!`);

    // Update IDs for rows with higher IDs than the deleted one
    const remainingRows = Array.from(table.querySelectorAll("tbody tr"));
    remainingRows.forEach(row => {
        const rowData = JSON.parse(row.getAttribute(`data-${dataName}`));
        const rowID = parseInt(rowData.id);

        if (rowID > selectedRowID) {
            const newID = rowID - 1;

            // Update the data attribute with the new ID
            rowData.id = newID;
            row.setAttribute(`data-${dataName}`, JSON.stringify(rowData));

            // Find the first cell with textContent matching the current ID
            for (const cell of row.cells) {
                if (parseInt(cell.textContent) === rowID) {
                    cell.textContent = newID; // Update the cell's content
                    break; // Stop searching after the first match
                }
            }
        }
    });

}

/*============================================================*/