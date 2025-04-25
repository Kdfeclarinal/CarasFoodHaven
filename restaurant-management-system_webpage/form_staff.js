/*============================================================*/

function addNewStaff() {
    // Validate form fields
    if (!formValidity('staff-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values of the input fields
    const staffID = document.querySelector('#staff-table tbody').rows.length + 1;
    const staffFirstName = document.getElementById("staff-first-name").value;
    const staffMiddleName = document.getElementById("staff-middle-name").value || "";
    const staffLastName = document.getElementById("staff-last-name").value;
    const staffDesignation = document.getElementById("staff-designation").value;
    const staffPhoneNumber = document.getElementById("staff-phonenumber").value;
    const staffAddress = document.getElementById("staff-address").value;
    const staffEmail = document.getElementById("staff-email").value;
    const staffEmailConfirm = document.getElementById("staff-email-confirm").value;
    const staffStatus = document.getElementById("staff-status").value;

    // Check if email and confirm email are the same
    if (staffEmail !== staffEmailConfirm) {
        showNotification(`Emails do not match. Ensure 'Email' and 'Confirm Email' fields are identical.`);
        return;
    }

    // Create full name in the desired format
    const staffFullName = `${staffLastName}, ${staffFirstName} ${staffMiddleName ? staffMiddleName : ''}`.trim();

    // Get the table and search for the row where the 2nd column matches the staff full name
    const table = document.getElementById("staff-table");
    const rows = table.querySelectorAll("tbody tr");

    // Check if the staff already exists in the 2nd column
    for (const row of rows) {
        const cells = row.getElementsByTagName("td");
        const existingStaffFullName = cells[1].textContent.trim();

        if (existingStaffFullName.toLowerCase() === staffFullName.toLowerCase()) {
            showNotification(`Staff Member: '${existingStaffFullName}' already exists!`);
            return; // Exit if the staff already exists
        }
    }

    // Create a new table row element
    const newRow = document.createElement("tr");

    // Create staffData object for consistent storage
    const staffData = {
        id: staffID,
        firstName: staffFirstName,
        middleName: staffMiddleName,
        lastName: staffLastName,
        designation: staffDesignation,
        phoneNumber: staffPhoneNumber,
        address: staffAddress,
        email: staffEmail,
        status: staffStatus
    };

    // Setting staffData as a custom attribute on the row
    newRow.setAttribute("data-staff", JSON.stringify(staffData));

    // Creating cells
    const staffIDCell = document.createElement("td");
    const staffFullNameCell = document.createElement("td");
    const staffContactInfoCell = document.createElement("td");
    const staffStatusCell = document.createElement("td");

    // Setting cell contents
    staffIDCell.textContent = staffID;
    staffFullNameCell.textContent = staffFullName; // Use the formatted full name
    staffContactInfoCell.innerHTML = `${staffPhoneNumber}<br>${staffEmail}`;

    // Create the status badge
    const statusBadge = document.createElement('span');
    statusBadge.textContent = staffStatus;
    statusBadge.className = `status-${staffStatus.toLowerCase()}`;

    // Clear and append the status badge to the status cell
    staffStatusCell.className = 'status-cell'; // Ensure correct cell styling
    staffStatusCell.innerHTML = ''; // Clear any existing content
    staffStatusCell.appendChild(statusBadge);

    // Append cells to the new row
    newRow.appendChild(staffIDCell);
    newRow.appendChild(staffFullNameCell);
    newRow.appendChild(staffContactInfoCell);
    newRow.appendChild(staffStatusCell);

    // Add click event listener to the new row
    newRow.addEventListener('click', function () {
        staff_tableRowClicked('data-staff', newRow); // Call the callback function when a row is clicked
        highlightClickedTableRow('staff-table', newRow); // Call the callback function when a row is clicked
    });

    // Append the new row to the table body
    table.querySelector("tbody").appendChild(newRow);

    // Clear the input fields of the form
    clearFormFields('staff-table', 'staff-form');

    showNotification(`Staff Member: '${staffFullName}' added successfully!`);
}
  
/*============================================================*/

function staff_tableRowClicked(dataRow, row) {
    // Access the data stored in the row's custom attribute
    const rowData = JSON.parse(row.getAttribute(dataRow));

    // Set form field values using the rowData object
    document.getElementById("staff-id").value = rowData.id;
    document.getElementById("staff-status").value = rowData.status;
    document.getElementById("staff-first-name").value = rowData.firstName;
    document.getElementById("staff-middle-name").value = rowData.middleName || ''; // Default to empty if undefined
    document.getElementById("staff-last-name").value = rowData.lastName;
    document.getElementById("staff-designation").value = rowData.designation;
    document.getElementById("staff-phonenumber").value = rowData.phoneNumber;
    document.getElementById("staff-address").value = rowData.address;
    document.getElementById("staff-email").value = rowData.email;
}

/*============================================================*/

function updateSelectedStaff() {
    // Find the currently selected row
    const selectedRow = document.querySelector("#staff-table .clickedTableRow");

    // Check if a row is selected
    if (!selectedRow) {
        showNotification(`Select a row to update from the table.`);
        return;
    }

    // Validate form fields
    if (!formValidity('staff-form')) {
        showNotification(`Fill all required fields with valid input.`);
        return;
    }

    // Get the values of the input fields
    const selectedRowData = JSON.parse(selectedRow.getAttribute('data-staff'));
    const staffID = selectedRowData.id;
    
    const staffStatus = document.getElementById("staff-status").value;
    const staffFirstName = document.getElementById("staff-first-name").value;
    const staffMiddleName = document.getElementById("staff-middle-name").value;
    const staffLastName = document.getElementById("staff-last-name").value;
    const staffDesignation = document.getElementById("staff-designation").value;
    const staffPhoneNumber = document.getElementById("staff-phonenumber").value;
    const staffAddress = document.getElementById("staff-address").value;
    const staffEmail = document.getElementById("staff-email").value;
    const staffEmailConfirm = document.getElementById("staff-email-confirm").value;

    // Check if email and confirm email are the same
    if (staffEmail !== staffEmailConfirm) {
        showNotification(`Emails do not match. Ensure 'Email' and 'Confirm Email' fields are identical.`);
        return;
    }

    // Update the data-staff attribute with the new data
    const staffData = {
        id: staffID,
        status: staffStatus,
        firstName: staffFirstName,
        middleName: staffMiddleName,
        lastName: staffLastName,
        designation: staffDesignation,
        phoneNumber: staffPhoneNumber,
        address: staffAddress,
        email: staffEmail,
    };

    selectedRow.setAttribute("data-staff", JSON.stringify(staffData));

    // Create full name in the desired format
    const staffFullName = `${staffLastName}, ${staffFirstName} ${staffMiddleName ? staffMiddleName : ''}`.trim();

    // Update the displayed cell contents
    const cells = selectedRow.querySelectorAll("td");
    if (cells.length >= 4) {
        cells[0].textContent = staffID; // Update the ID cell
        cells[1].textContent = staffFullName; // Update the name cell
        cells[2].innerHTML = `${staffPhoneNumber}<br>${staffEmail}`; // Update contact info
        
        // Create the status badge (span) if it doesn't exist
        let statusBadge = cells[3].querySelector('span');
        if (!statusBadge) {
            statusBadge = document.createElement('span');
            cells[3].appendChild(statusBadge);
        }

        // Update the status badge text and class
        statusBadge.textContent = staffStatus; // Update the status text
        statusBadge.className = `status-${staffStatus.toLowerCase()}`; // Change class based on new status
        cells[3].className = 'status-cell'; // Ensure correct cell styling

        showNotification(`Staff Member: '${staffFullName}' updated successfully!`);
    }

    // Highlight the updated row for visual feedback
    animateRowHighlight(selectedRow);

    // Clear the input fields of the form
    clearFormFields('staff-table', 'staff-form');
}

/*============================================================*/