/*============================================================*/

function addSelectedIngredientsToStockInTable(tableBodyID, ifStockIN) {
    const tableBody = document.getElementById(tableBodyID);
    const stockInTableBody = document.querySelector('#stock-in-n-out-table tbody');

    // Get all rows from the provided table
    const rows = tableBody.querySelectorAll('tr');

    // Check if at least one checkbox is selected
    const hasChecked = Array.from(rows).some(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        return checkbox && checkbox.checked;
    });

    if (!hasChecked) {
        showNotification(`Select at least one ingredient to stock in/out.`);
        return; // Stop further execution if no ingredients are selected
    }

    openModal("stock-in-n-out-modal");

    // Clear previous entries from the stock-in table
    stockInTableBody.innerHTML = '';

    // Update header and button text based on ifStockIN
    const header = document.getElementById('stock-in-n-out-header');
    const columnHead = document.getElementById('stock-in-n-out-column-head');
    const confirmButton = document.getElementById('confirmed-ings-to-stock-btn');

    if (ifStockIN) {
        header.textContent = "INGREDIENTS TO STOCK IN";
        columnHead.innerHTML = "QUANTITY<br>ADDED"; // Use innerHTML for line break
        confirmButton.textContent = "Confirm Stock In";
    } else {
        header.textContent = "INGREDIENTS TO STOCK OUT";
        columnHead.innerHTML = "QUANTITY<br>REMOVED"; // Use innerHTML for line break
        confirmButton.textContent = "Confirm Stock Out";
    }



    rows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');

        let stockID = "?";

        if (checkbox && checkbox.checked) {
            let rowData, ingredientID;

            // Check the source table and extract the appropriate data
            if (tableBodyID === "stock-table_body") {
                rowData = JSON.parse(row.getAttribute("data-stock"));
                stockID = rowData.id;
                ingredientID = rowData.ingredientID;
            } else if (tableBodyID === "ingredient-table_body") {
                rowData = JSON.parse(row.getAttribute("data-ingredient"));
                ingredientID = rowData.id;
            }

            // Create a new row for the stock-in/out table
            const newRow = document.createElement('tr');

            // Add the stock ID (first column)
            const stockIDCell = document.createElement('td');
            stockIDCell.textContent = stockID; 
            newRow.appendChild(stockIDCell);

            // Add the ingredient ID and name with unit as the second column
            const ingredientNameCell = document.createElement('td');
            ingredientNameCell.textContent = `[${ingredientID}] ${grabSpecificDataFromID('ingredient', ingredientID, 'name')}`;
            newRow.appendChild(ingredientNameCell);

            // Add input for Quantity Added/Removed
            const quantityCell = document.createElement('td');
            quantityCell.innerHTML = `<input type="number" min="1" placeholder="Qty" required>`; // Placeholder as "Qty"
            newRow.appendChild(quantityCell);

            // Use grabSpecificDataFromID to get the unit
            const ingredientUnit = grabSpecificDataFromID('ingredient', ingredientID, 'unit');
        
            // Add the unit below the quantity input
            const unitSpan = document.createElement("span");
            unitSpan.textContent = ingredientUnit;
            quantityCell.appendChild(document.createElement("br")); // Line break for better layout
            quantityCell.appendChild(unitSpan);

            // Add input for Expiration Date
            const expirationCell = document.createElement('td');
            const expirationInput = document.createElement('input');
            expirationInput.type = 'date';
            expirationInput.required = true;

            // Set the minimum date to today
            const today = new Date();
            const todayString = today.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            expirationInput.min = todayString;

            // Auto-fill expiration date and disable the input if not stocking in
            if (ifStockIN) {
                if (tableBodyID === "stock-table_body") {
                    expirationInput.value = rowData.expirationDate; // Auto-fill with expiration date from data-stock
                    expirationInput.disabled = true; // Disable the expiration date input
                }
            } else {
                // Auto-fill and disable for stock out
                expirationInput.value = rowData.expirationDate; // Auto-fill with expiration date from data-stock
                expirationInput.disabled = true; // Disable the expiration date input
            }

            expirationCell.appendChild(expirationInput);
            newRow.appendChild(expirationCell);

            // Add input for Days Until Expiration Alert
            const daysAlertCell = document.createElement('td');
            const daysAlertInput = document.createElement('input');
            daysAlertInput.type = 'number';
            daysAlertInput.min = 0;
            daysAlertInput.placeholder = "Days";

            // Auto-fill with alert threshold
            if (tableBodyID === "stock-table_body") {
                daysAlertInput.value = ifStockIN ? rowData.expirationAlertTH : rowData.expirationAlertTH; // Auto-fill with alert threshold from data-stock
            }
            daysAlertCell.appendChild(daysAlertInput);
            newRow.appendChild(daysAlertCell);

            // Add input for Remarks
            const remarksCell = document.createElement('td');
            remarksCell.innerHTML = `<input type="text" placeholder="Remarks">`;
            newRow.appendChild(remarksCell);

            // Append the new row to the stock-in/out table
            stockInTableBody.appendChild(newRow);
        }
    });
}

/*============================================================*/

function confirmedIngsToStock(button) { 
    const stockTableBody = document.querySelector('#stock-table tbody');
    const stockInNOutTableBody = document.querySelector('#stock-in-n-out-table tbody');
    const stockTransactionTableBody = document.querySelector('#stock-transaction-table_body');

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const isStockOut = button.textContent.trim() === "Confirm Stock Out"; // Check if it's stock-out action

    let hasInvalidInput = false; // Flag for invalid input
    let stocksOutInsufficient = false; // Flag for insufficient stock for stock out
    let firstInvalidInput; // To store the first invalid input element for focusing

    const stockInDataArray = [];
    const stockOutDataArray = [];

    // Use 'for...of' loop to allow early exit
    for (const row of stockInNOutTableBody.rows) {
        const generatedStockID = stockTableBody.rows.length + 1; // Auto-generate Stock ID

        const stockID = row.cells[0].innerText.trim();
        const ingredientID = parseInt(row.cells[1].innerHTML.match(/\[(.*?)\]/)[1]); // Ingredient ID extracted from format
        const quantityAddedInput = row.cells[2].querySelector('input');
        const expirationInput = row.cells[3].querySelector('input');
        const expirationAlertInput = row.cells[4].querySelector('input');
        const remarksInput = row.cells[5].querySelector('input');

        const quantityAdded = parseInt(quantityAddedInput.value) || 0;
        const expirationDate = expirationInput.value || '';
        const expirationAlertTH = parseInt(expirationAlertInput.value) || 0;
        const remarks = remarksInput.value || '';

        // Validate quantity added
        if (!quantityAddedInput.checkValidity()) {
            hasInvalidInput = true;
            firstInvalidInput = firstInvalidInput || quantityAddedInput; // Focus on the first invalid input
            quantityAddedInput.reportValidity(); // Focus on the invalid quantity input
            showNotification(`Invalid quantity for Ingredient ID: '${ingredientID}'`);
            break; // Stop the loop on invalid input
        }

        // Validate expiration date
        if (!expirationInput.checkValidity() || new Date(expirationInput.value) < new Date()) {
            hasInvalidInput = true;
            firstInvalidInput = firstInvalidInput || expirationInput; // Focus on the first invalid input
            expirationInput.reportValidity(); // Focus on the invalid expiration date input
            showNotification(`Invalid expiration date for Ingredient ID: '${ingredientID}'`);
            break; // Stop the loop on invalid input
        }

        // Continue with the logic if inputs are valid
        let currentQtyRemaining = 0;
        let updatedQtyRemaining = quantityAdded;

        // Search for an existing row with the same stock ID
        let existingRow = Array.from(stockTableBody.rows).find(
            stockRow => stockRow.cells[1].textContent.trim() === stockID
        );

        if (existingRow) {
            // Update existing row's quantity and data attribute
            currentQtyRemaining = parseInt(existingRow.cells[3].textContent);
            updatedQtyRemaining = isStockOut
                ? currentQtyRemaining - quantityAdded
                : currentQtyRemaining + quantityAdded;

            // Prevent negative quantity for stock out
            if (isStockOut && updatedQtyRemaining < 0) {
                stocksOutInsufficient = true;
                quantityAddedInput.setCustomValidity(`Insufficient quantity available for Ingredient ID: '${ingredientID}'`);
                quantityAddedInput.reportValidity(); // Focus on the insufficient quantity input to stock out
                showNotification(`Insufficient quantity available for Ingredient ID: '${ingredientID}'`);
                break; // Stop processing if not enough stock is available
            }

            existingRow.cells[3].textContent = 
                `${updatedQtyRemaining} ${grabSpecificDataFromID('ingredient', ingredientID, 'unit')}`;

            const stockData = JSON.parse(existingRow.getAttribute('data-stock'));
            stockData.quantityRemaining = updatedQtyRemaining;
            stockData.expirationDate = expirationDate || stockData.expirationDate; 
            stockData.expirationAlertTH = expirationAlertTH || stockData.expirationAlertTH; 

            existingRow.setAttribute('data-stock', JSON.stringify(stockData));

            // Highlight the updated row for visual feedback
            animateRowHighlight(existingRow);
        } else {
            // Create a new row if no match found
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${generatedStockID}</td>
                <td>${formattedIngredientIDWithExtra(ingredientID, true)}</td>
                <td>${quantityAdded + ' ' + grabSpecificDataFromID('ingredient', ingredientID, 'unit')}</td>
                <td>AVAILABLE</td>
            `;
            newRow.setAttribute('data-stock', JSON.stringify({
                id: generatedStockID,
                ingredientID: ingredientID,
                originalQuantity: quantityAdded,
                quantityRemaining: quantityAdded,
                stockInDate: today,
                expirationDate,
                expirationAlertTH,
                stockStatus: 'AVAILABLE'
            }));

            newRow.addEventListener('click', (event) => {
                const clickedCell = event.target.closest('td');
                const firstCell = newRow.querySelector('td:first-child');
                if (clickedCell === firstCell) return; 
                stock_tableRowClicked('data-stock', newRow);
                highlightClickedTableRow('stock-table', newRow);
            });

            stockTableBody.appendChild(newRow);
        }

        // Create a stock transaction row
        const txnRow = document.createElement('tr');
        const transactionID = stockTransactionTableBody.rows.length + 1;
        const transactionType = isStockOut ? 'STOCK OUT' : 'STOCK IN';
        const qtyChange = isStockOut ? `- ${quantityAdded}` : `+ ${quantityAdded}`;

        txnRow.innerHTML = `
            <td>${transactionID}</td>
            <td>${existingRow ? existingRow.cells[1].textContent : generatedStockID}</td>
            <td>${formattedIngredientIDWithExtra(ingredientID, true)}</td>
            <td>${qtyChange + ' ' + grabSpecificDataFromID('ingredient', ingredientID, 'unit')}</td>
            <td>${transactionType}</td>
        `;
        txnRow.setAttribute('data-stock-transaction', JSON.stringify({
            id: transactionID,
            stock_ID: existingRow ? existingRow.cells[1].textContent : generatedStockID,
            ingredientID: ingredientID,
            quantity_added: isStockOut ? 0 : quantityAdded,
            quantity_removed: isStockOut ? quantityAdded : 0,
            transaction_type: transactionType,
            transactionDateTime: new Date().toISOString(),
            remarks,
            order_ID: '',
            emp_ID: ''
        }));

        txnRow.addEventListener('click', (event) => {
            stockTransaction_tableRowClicked('data-stock-transaction', txnRow);
            highlightClickedTableRow('stock-transaction-table', txnRow);
        });

        stockTransactionTableBody.appendChild(txnRow);

        updateIngredientQuantity(ingredientID, quantityAdded, transactionType);

        if (isStockOut) {
            stockOutDataArray.push({
                ingredientID: ingredientID,
                originalQuantity: quantityAdded,
                quantityRemaining: updatedQtyRemaining,
                stockInDate: today,
                expirationDate,
                expirationAlertTH,
                stockStatus: 'OUT',
            });
        } else {
            stockInDataArray.push({
                ingredientID: ingredientID,
                originalQuantity: quantityAdded,
                quantityRemaining: updatedQtyRemaining,
                stockInDate: today,
                expirationDate,
                expirationAlertTH,
                stockStatus: 'AVAILABLE',
            });
        }
    }

    console.log('Stock In Data:', stockInDataArray);
    console.log('Stock Out Data:', stockOutDataArray);

    if (hasInvalidInput || stocksOutInsufficient) return; // Stop entire operation if any input is invalid

    const dataToSend = isStockOut ? stockOutDataArray : stockInDataArray;

    fetch('handlers/stock_handler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockData: dataToSend })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showNotification('Stock update successful.');

        dataToSend.forEach(item => {
            console.log('Item being sent:', item);
            fetch('handlers/ingredient_handler.php', {
                method: 'POST',
                headers: {                    
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_quantity',
                    'ingredient-id': item.ingredientID,
                    'new-quantity': item.quantityRemaining // or calculate based on stock out
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log(`Ingredient ID ${item.ingredientID} quantity updated successfully in the database.`);
                } else {
                    console.error(`Failed to update ingredient ID ${item.ingredientID} in the database: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error updating ingredient quantity:', error);
            });
        });

    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Failed to update stock.');
    });

    stockInNOutTableBody.innerHTML = ''; // Clear the modal content
    closeModal('stock-in-n-out-modal'); // Close the modal
}

/*============================================================*/

function updateIngredientQuantity(ingredientID, quantityChange, transactionType) {
    const ingredientTable = document.getElementById("ingredient-table");
    const rows = Array.from(ingredientTable.querySelectorAll("tbody tr"));

    // Find the row with matching ingredient ID
    const matchingRow = rows.find(row => {
        const ingredientData = JSON.parse(row.getAttribute("data-ingredient"));
        return ingredientData.id === ingredientID;
    });

    if (!matchingRow) {
        console.warn(`Ingredient with ID ${ingredientID} not found in the table.`);
        return;
    }

    // Parse the current quantity from the row's data attribute
    const ingredientData = JSON.parse(matchingRow.getAttribute("data-ingredient"));
    let currentQuantity = ingredientData.quantity;

    // Adjust the quantity based on the transaction type
    const newQuantity = transactionType === 'STOCK IN' 
        ? currentQuantity + quantityChange 
        : currentQuantity - quantityChange;

    if (newQuantity < 0) {
        showNotification(`Insufficient quantity for Ingredient ID: '${ingredientID}' to stock out.`);
        return; // Stop if the quantity becomes negative
    }

    // Update the data attribute with the new quantity
    ingredientData.quantity = newQuantity;
    matchingRow.setAttribute("data-ingredient", JSON.stringify(ingredientData));

    // Update the displayed quantity in the table
    const quantityCell = matchingRow.querySelector("td:last-child span");
    const unit = ingredientData.unit;
    quantityCell.textContent = `${newQuantity} ${unit}`;
    
    // Store the previous class
    const previousClass = quantityCell.className;

    // Determine the new class based on the quantity
    const lowStockThreshold = ingredientData.lowStockTH;
    const mediumStockThreshold = ingredientData.mediumStockTH;
    let newClass = 'status-highstockth'; // Default class

    if (newQuantity <= lowStockThreshold) {
        newClass = 'status-lowstockth';
    } else if (newQuantity <= mediumStockThreshold) {
        newClass = 'status-mediumstockth';
    }

    // Update the class only if it has changed
    if (previousClass !== newClass) {
        quantityCell.className = newClass;

        // Update the badge based on the class change
        if (newClass === 'status-lowstockth') {
            updateBadge('ingredientPage', 1);
        } else if (previousClass === 'status-lowstockth') {
            updateBadge('ingredientPage', -1);
        }
    }

    // fetch('handlers/update_ingredient_quantity.php', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         action: 'update_quantity',
    //         ingredientID: ingredientID,
    //         newQuantity: newQuantity
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.status === 'success') {
    //         console.log(`Ingredient ID ${ingredientID} quantity updated successfully in the database.`);
    //     } else {
    //         console.error(`Failed to update ingredient ID ${ingredientID} in the database: ${data.message}`);
    //     }
    // })
    // .catch(error => {
    //     console.error('Error updating ingredient quantity:', error);
    // });
}

/*============================================================*/

function stock_tableRowClicked(dataRow, row) {
    // Access the data stored in row's custome attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Populate the form fields with the data from the clicked row
    document.getElementById('stock-id').value = rowData.id;
    document.getElementById('stock-ingredient-id').value = formattedIngredientIDWithExtra(rowData.ingredientID,false);
    document.getElementById('stock-status').value = rowData.stockStatus;
    document.getElementById('stock-original-qty').value = rowData.originalQuantity;
    document.getElementById('stock-qty-left').value = rowData.quantityRemaining;
    document.getElementById('stock-in-date').value = rowData.stockInDate;
    document.getElementById('stock-expiration-date').value = rowData.expirationDate;
    document.getElementById('stock-expiration-alert-threshold').value = rowData.expirationAlertTH;
}

/*============================================================*/

function stockTransaction_tableRowClicked(dataRow, row) {
    // Access the data stored in row's custome attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Fill form inputs with transaction data
    document.getElementById('stock-transaction-id').value = rowData.id;
    document.getElementById('stock-transaction-stock-id').value = rowData.stock_ID;
    document.getElementById('stock-transaction-ingredient-id').value = formattedIngredientIDWithExtra(rowData.ingredientID,false);
    document.getElementById('stock-ingredient-qty-added').value = rowData.quantity_added;
    document.getElementById('stock-ingredient-qty-removed').value = rowData.quantity_removed;
    document.getElementById('stock-transaction-transaction-type').value = rowData.transaction_type;
    document.getElementById('stock-ingredient-transaction-date').value = rowData.transactionDateTime.split('T')[0]; // Extract the date only
    document.getElementById('stock-ingredient-remarks').value = rowData.remarks;
    document.getElementById('stock-transaction-staff-id').value = rowData.emp_ID;
    document.getElementById('stock-transaction-order-id').value = rowData.order_ID;
}

/*============================================================*/