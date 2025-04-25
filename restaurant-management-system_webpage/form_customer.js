// /*============================================================*/

function addNewCustomer() {
    // Validate form fields
    if (!formValidity('customer-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values of the input fields
    const customerID = document.querySelector('#customer-table tbody').rows.length + 1
    const customerStatus = document.getElementById("customer-status").value;
    const customerFirstName = document.getElementById("customer-first-name").value;
    const customerMiddleName = document.getElementById("customer-middle-name").value || "";
    const customerLastName = document.getElementById("customer-last-name").value;
    const customerGender = document.getElementById("customer-gender").value;
    const customerBirthdate = document.getElementById("customer-birthdate").value;
    const customerPhoneNumber = document.getElementById("customer-phonenumber").value;
    const customerAddress = document.getElementById("customer-address").value;
    const customerEmail = document.getElementById("customer-email").value;
    const customerEmailConfirm = document.getElementById("customer-email-confirm").value;

    // Check if email and confirm email are the same
    if (customerEmail !== customerEmailConfirm) {
        showNotification(`Emails do not match. Ensure 'Email' and 'Confirm Email' fields are identical.`);
        return;
    }

    // Create full name in the desired format
    const customerFullName = `${customerLastName}, ${customerFirstName} ${customerMiddleName ? customerMiddleName : ''}`.trim();

    // Get the table and search for the row where the 2nd column matches the customer full name
    const table = document.getElementById("customer-table");
    const rows = table.querySelectorAll("tbody tr");

    // Check if the customer already exists in the 2nd column
    for (const row of rows) {
        const cells = row.getElementsByTagName("td");
        const existingCustomerFullName = cells[1].textContent.trim();

        if (existingCustomerFullName.toLowerCase() === customerFullName.toLowerCase()) {
            showNotification(`Customer: '${customerFullName}' already exists!`);
            return; // Exit if the customer already exists
        }
    }

    // Create a new table row element
    const newRow = document.createElement("tr");

    // Creating customerData object
    const customerData = {
        id: customerID,
        status: customerStatus,
        firstName: customerFirstName,
        middleName: customerMiddleName,
        lastName: customerLastName,
        gender: customerGender,
        birthdate: customerBirthdate,
        phoneNumber: customerPhoneNumber,
        address: customerAddress,
        email: customerEmail,
        fullName: customerFullName,
    };

    // Setting customerData as a custom attribute on the row
    newRow.setAttribute("data-customer", JSON.stringify(customerData));

    // Creating cells
    const customerIDCell = document.createElement("td");
    const customerFullNameCell = document.createElement("td");
    const customerContactInfoCell = document.createElement("td");
    const customerStatusCell = document.createElement("td");

    // Setting cell contents
    customerIDCell.textContent = customerData.id;
    customerFullNameCell.textContent = customerData.fullName; // Use the formatted full name
    customerContactInfoCell.innerHTML = `${customerData.phoneNumber}<br>${customerData.email}`;

    // Create the status badge
    const statusBadge = document.createElement('span');
    statusBadge.textContent = customerStatus;
    statusBadge.className = `status-${customerStatus.toLowerCase()}`;

    // Clear and append the status badge to the status cell
    customerStatusCell.className = 'status-cell'; // Ensure correct cell styling
    customerStatusCell.innerHTML = ''; // Clear any existing content
    customerStatusCell.appendChild(statusBadge);

    // Append cells to the new row
    newRow.appendChild(customerIDCell);
    newRow.appendChild(customerFullNameCell);
    newRow.appendChild(customerContactInfoCell);
    newRow.appendChild(customerStatusCell);

    // Add click event listener to the new row
    newRow.addEventListener('click', function () {
        customer_tableRowClicked('data-customer', newRow); // Call the callback function when a row is clicked
        highlightClickedTableRow('customer-table', newRow); // Call the callback function when a row is clicked
    });

    // Append the new row to the table body
    table.querySelector("tbody").appendChild(newRow);

    // Clear the input fields of the form
    clearFormFields('customer-table', 'customer-form');

    showNotification(`Customer: '${customerFullName}' added successfully!`);
}
  
/*============================================================*/

function customer_tableRowClicked(dataRow, row) {
    // Access the data stored in the row's custom attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Populate the form fields with the values from the rowData object
    document.getElementById("customer-id").value = rowData.id;
    document.getElementById("customer-status").value = rowData.status;
    document.getElementById("customer-first-name").value = rowData.firstName;
    document.getElementById("customer-middle-name").value = rowData.middleName;
    document.getElementById("customer-last-name").value = rowData.lastName;
    document.getElementById("customer-gender").value = rowData.gender;
    document.getElementById("customer-birthdate").value = rowData.birthdate;
    document.getElementById("customer-phonenumber").value = rowData.phoneNumber;
    document.getElementById("customer-address").value = rowData.address;
    document.getElementById("customer-email").value = rowData.email;
}

/*============================================================*/

function updateSelectedCustomer() {
    // Find the currently selected row
    const selectedRow = document.querySelector("#customer-table .clickedTableRow");

    // Check if a row is selected
    if (!selectedRow) {
        showNotification(`Select a row to update from the table.`);
        return;
    }

    // Validate form fields
    if (!formValidity('customer-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values of the input fields
    const selectedRowData = JSON.parse(selectedRow.getAttribute('data-customer'));
    const customerID = selectedRowData.id;
    
    const customerData = {
        id: customerID,
        status: document.getElementById("customer-status").value,
        firstName: document.getElementById("customer-first-name").value,
        middleName: document.getElementById("customer-middle-name").value,
        lastName: document.getElementById("customer-last-name").value,
        gender: document.getElementById("customer-gender").value,
        birthdate: document.getElementById("customer-birthdate").value,
        phoneNumber: document.getElementById("customer-phonenumber").value,
        address: document.getElementById("customer-address").value,
        email: document.getElementById("customer-email").value,
        emailConfirm: document.getElementById("customer-email-confirm").value
    };

    // Check if email and confirm email are the same
    if (customerData.email !== customerData.emailConfirm) {
        showNotification(`Emails do not match. Ensure 'Email' and 'Confirm Email' fields are identical.`);
        return;
    }

    // Update the data-customer attribute with the new data
    selectedRow.setAttribute("data-customer", JSON.stringify(customerData));

    // Create full name in the desired format
    const customerFullName = `${customerData.lastName}, ${customerData.firstName} ${customerData.middleName ? customerData.middleName : ''}`.trim();

    // Update the displayed cell contents
    const cells = selectedRow.querySelectorAll("td");
    if (cells.length >= 4) {
        cells[0].textContent = customerData.id; // Update the ID cell
        cells[1].textContent = customerFullName; // Update the name cell
        cells[2].innerHTML = `${customerData.phoneNumber}<br>${customerData.email}`; // Update contact info
        
        // Create the status badge (span) if it doesn't exist
        let statusBadge = cells[3].querySelector('span');
        if (!statusBadge) {
            statusBadge = document.createElement('span');
            cells[3].appendChild(statusBadge);
        }

        // Update the status badge text and class
        statusBadge.textContent = customerData.status; // Update the status text
        statusBadge.className = `status-${customerData.status.toLowerCase()}`; // Change class based on new status
        cells[3].className = 'status-cell'; // Ensure correct cell styling

        showNotification(`Customer: '${customerFullName}' updated successfully!`);
    }

    // Highlight the updated row for visual feedback
    animateRowHighlight(selectedRow);

    // Clear the input fields of the form
    clearFormFields('customer-table', 'customer-form');
}

/*============================================================*/