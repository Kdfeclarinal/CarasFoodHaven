/*============================================================*/

function addNewMenuCategory() {

    if (!formValidity('menu-category-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values of the input fields
    const menuCategoryID = document.querySelector('#menu-category-table tbody').rows.length + 1
    const menuCategoryName = document.getElementById("menu-category-name").value;

    // Check for duplicate name in the table
    const table = document.getElementById("menu-category-table");
    const existingRows = table.querySelectorAll("tbody tr");

    for (const row of existingRows) {
        const rowData = JSON.parse(row.getAttribute("data-menu-category"));
        const existingName = rowData.name.trim();

        if (existingName.toLowerCase() === menuCategoryName.toLowerCase()) {
            showNotification(`Menu Category: '${menuCategoryName}' already exists!`);
            return;
        }
    }

    const addCategoryData = new FormData();
    addCategoryData.append('menu-category-name', menuCategoryName);
    addCategoryData.append('action', 'add');

    fetch('handlers/menu_category_handler.php', {
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


    // Create a new table row element
    const newRow = document.createElement("tr");

    // Store category data as an object with clear keys
    const menuCategoryData = {
        id: menuCategoryID,
        name: menuCategoryName
    };

    // Set the data object as a custom attribute on the row
    newRow.setAttribute("data-menu-category", JSON.stringify(menuCategoryData));

    // Create cells for the row
    newRow.innerHTML = `
        <td>${menuCategoryID}</td>
        <td>${menuCategoryName}</td>
    `;

    // Add a click event listener to the new row
    newRow.addEventListener('click', function () {
        menuCategory_tableRowClicked('data-menu-category', newRow);
        highlightClickedTableRow('menu-category-table', newRow);
    });

    // Append the new row to the table body
    table.querySelector("tbody").appendChild(newRow);

    // Add the new category to the combobox with its ID and name
    const menuCategoryComboBox = document.getElementById("menu-category-combobox");
    menuCategoryComboBox.add(new Option(menuCategoryName, menuCategoryID));

    // Clear the input fields of the form
    clearFormFields('menu-category-table', 'menu-category-form');

    showNotification(`Menu Category: '${menuCategoryName}' added successfully!`);
}
})
.catch(error => {
    console.error('Error:', error);
    showNotification('An error occured while adding the ingredient unit.');
});
}

/*============================================================*/

function menuCategory_tableRowClicked(dataRow, row) {
    // Access the data stored in the row's custom attribute as an object
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Set the input fields with the corresponding values
    document.getElementById("menu-category-id").value = rowData.id;
    document.getElementById("menu-category-name").value = rowData.name;
}

/*============================================================*/

function updateSelectedMenuCategory() {
    // Find the currently selected row
    const selectedRow = document.querySelector("#menu-category-table .clickedTableRow");

    // Check if a row is selected
    if (!selectedRow) {
        showNotification(`Select a row to update from the table.`);
        return;
    }

    // Validate the form inputs
    if (!formValidity('menu-category-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get values from the input fields
    const selectedRowData = JSON.parse(selectedRow.getAttribute('data-menu-category'));
    const menuCategoryID = selectedRowData.id;
    const menuCategoryName = document.getElementById("menu-category-name").value;

    const updateCategoryData = new FormData();
    updateCategoryData.append('category-id', menuCategoryID);
    updateCategoryData.append('update-category-name', menuCategoryName);
    updateCategoryData.append('action', 'update');

    fetch('handlers/menu_category_handler.php', {
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

    // Update the data-menu-category attribute with new data as an object
    const menuCategoryData = {
        id: menuCategoryID,
        name: menuCategoryName
    };
    selectedRow.setAttribute("data-menu-category", JSON.stringify(menuCategoryData));

    // Update the visible content of the row cells
    const cells = selectedRow.querySelectorAll("td");
    if (cells.length >= 2) {
        cells[0].textContent = menuCategoryID;   // Update the ID cell
        cells[1].textContent = menuCategoryName; // Update the Name cell
    }

    // Highlight the updated row for visual feedback
    animateRowHighlight(selectedRow);

    showNotification(`Menu Category: '${menuCategoryName}' updated successfully!`);

    // Update the combo box with the new data
    repopulateComboBoxFromTable("menu-category-table", "data-menu-category", "menu-category-combobox");

    // Clear the input fields of the form
    clearFormFields('menu-category-table', 'menu-category-form');

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
showNotification('An error occurred while updating the menu category.');
});
}

/*============================================================*/

function deleteSelectedMenuCategory(tableID, dataName) {
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

    fetch('handlers/menu_category_handler.php', {
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

    repopulateComboBoxFromTable("menu-category-table", "data-menu-category", "menu-category-combobox");
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
showNotification('An error occurred while deleting the menu category.');
});
}

/*============================================================*/