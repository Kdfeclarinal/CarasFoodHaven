

document.addEventListener("DOMContentLoaded", function() {

    // Hide all div containers initially
    const divContainers = document.querySelectorAll(".container");
    divContainers.forEach(container => {
        container.style.display = "none";
    });

    /*==============================*/

    // Function to show the selected div container and hide others
    function showContainer(containerId) {

      // Select and remove all existing notifications in the document
      const allNotifications = document.querySelectorAll('.notification');
      allNotifications.forEach(notification => notification.remove());

      divContainers.forEach(container => {
          if (container.id === containerId) {
              container.style.display = "block";
          } else {
              container.style.display = "none";
          }
      });

    }

    /*==============================*/

    // Add event listeners to vertical menu buttons
    const verticalMenuButtons = document.querySelectorAll(".verticalmenu-btn");
    verticalMenuButtons.forEach(button => {
        button.addEventListener("click", function() {
            const containerId = button.id.replace("Page", "");
            showContainer(containerId);
            // Make the clicked button active and others inactive
            verticalMenuButtons.forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");
        });
    });

    /*==============================*/

    // Set the "?Page" container as active by default
    const defaultContainerId = "orderManagement";
    const defaultButton = document.getElementById(defaultContainerId + "Page");

    showContainer(defaultContainerId);
    defaultButton.classList.add("active");
  
    /*==============================*/

    document.getElementById('staff-birthdate').max = new Date().toISOString().split("T")[0];
    document.getElementById('customer-birthdate').max = new Date().toISOString().split("T")[0];
  
    /*==============================*/

  });
  
  /*============================================================*/

  document.addEventListener("DOMContentLoaded", function() {
    const accountDropdown = document.querySelector('.account-dropdown');
    const dropdownArrow = document.getElementById('dropdown-arrow');

    accountDropdown.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent click from bubbling up
      accountDropdown.classList.toggle('active'); // Toggle the active class

      // Toggle the arrow direction
      if (accountDropdown.classList.contains('active')) {
        dropdownArrow.classList.remove('fa-caret-down');
        dropdownArrow.classList.add('fa-caret-up');
      } else {
        dropdownArrow.classList.remove('fa-caret-up');
        dropdownArrow.classList.add('fa-caret-down');
      }
    });

    document.addEventListener('click', function(event) {
      if (!accountDropdown.contains(event.target)) {
        accountDropdown.classList.remove('active'); // Remove active class when clicking outside
        dropdownArrow.classList.remove('fa-caret-up');
        dropdownArrow.classList.add('fa-caret-down');
      }
    });
  });

  /*============================================================*/ 

  function previewImage(event) {
      const file = event.target.files[0]; // Get the selected file
      const previewImage = document.getElementById('preview-image'); // Get the image element

      if (file) {
          const reader = new FileReader(); // Create a new FileReader instance

          // Define what happens when the file is read
          reader.onload = function(e) {
              previewImage.src = e.target.result; // Set the image src to the file's data URL
          }

          // Read the file as a data URL
          reader.readAsDataURL(file);
      } else {
          previewImage.src = '../img_placeholder.png'; // Reset to placeholder if no file is selected
      }
  }
  
  /*============================================================*/

  document.addEventListener("DOMContentLoaded", function() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      const tabbableElements = Array.from(form.querySelectorAll('input, select, button, .input-group input'))
        .filter(el => !el.disabled && el.tabIndex !== -1);

      form.addEventListener('keydown', function(event) {
        if (event.key === 'Tab' && !event.shiftKey) {
          const lastElement = tabbableElements[tabbableElements.length - 1];
          if (document.activeElement === lastElement) {
            event.preventDefault();
            tabbableElements[0].focus();
          }
        }
      });
    });
  });
  
  /*============================================================*/

  document.getElementById('toggle-mode').addEventListener('click', function(event) {
    event.preventDefault();
    const icon = document.getElementById('mode-icon');
    const toggleText = this;

    if (icon.classList.contains('fa-sun')) {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      toggleText.innerHTML = '<i class="fas fa-moon" id="mode-icon"></i> Toggle Dark Mode';
      // Add logic to switch to dark mode
    } else {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      toggleText.innerHTML = '<i class="fas fa-sun" id="mode-icon"></i> Toggle Light Mode';
      // Add logic to switch to light mode
    }
  });
  
  /*============================================================*/

  document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const orderCards = document.querySelectorAll('.order-card');

    // Function to update the counts on filter buttons
    function updateCounts() {
      const statuses = ['ALL', 'PENDING', 'PREPARING', 'READY FOR PICKUP', 'COMPLETE', 'CANCELED'];
      statuses.forEach(status => {
        const count = status === 'ALL' 
          ? orderCards.length 
          : document.querySelectorAll(`.order-card[data-status="${status}"]`).length;
        document.getElementById(`count-${status}`).textContent = count;
      });
    }

    // Function to handle filter button click and apply active class
    function handleFilterClick(button) {
      // Remove 'active' class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add 'active' class to the clicked button
      button.classList.add('active');

      // Filter orders based on the button's status
      const status = button.getAttribute('data-status');
      orderCards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        card.style.display = (status === 'ALL' || status === cardStatus) ? 'block' : 'none';
      });

      // Update counts after filtering
      updateCounts();
    }

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', () => handleFilterClick(button));
    });

    // Initial count update
    updateCounts();

    // Simulate a click on the "ALL" filter button on page load
    document.querySelector('.filter-btn[data-status="ALL"]').click();
  });

  /*============================================================*/   

  // Function to format the date and time
  function formatDateTime(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
      return date.toLocaleString('en-US', options); // Format the date and time
  } 

  const currentDateTimeElement = document.getElementById('current-date-time');

  // Function to update the date and time
  function updateDateTime() {
      const currentDateTime = formatDateTime(new Date());
      currentDateTimeElement.textContent = `Date & Time: ${currentDateTime}`;
  }

  // Initial call to set the date and time immediately
  updateDateTime();

  // Update the date and time every second
  setInterval(updateDateTime, 1000);

  /*============================================================*/ 










  /*============================================================*/

function clearFormFields(tableId,formId,ifAlert) {
    // Get the form element by ID
    const form = document.getElementById(formId);

    if (form) {
        // Select all input elements within the form and set their value to an empty string
        form.querySelectorAll('input').forEach(input => {
            input.value = '';
        });

        // Select all select elements within the form and set their value to the first option
        form.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        // Select all textarea elements within the form and set their value to an empty string
        form.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });

        // Check if the form is "menu-item-form"
        if (formId === "menu-item-form") {
            // Remove the image source from the imgBox_Display
            const previewImage = document.getElementById("preview-image");
            if (previewImage) {
                previewImage.src = "../img_placeholder.png";  // Set back to placeholder or empty image
            }

            // Remove all rows from the ingredient-list-table
            const ingredientListTableBody = document.getElementById("ingredient-list-table-body");
            if (ingredientListTableBody) {
                ingredientListTableBody.innerHTML = "";  // Clear all rows
            }
        }

        // Scroll the grandparent container of the form back to the top with smooth animation
        const grandParentContainer = form.parentElement?.parentElement;
        if (grandParentContainer) {
            grandParentContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Remove "clickedTableRow" class from the previously clicked row in the specified table
        const table = document.getElementById(tableId);
        if (table) {
            const previouslyClickedRow = table.querySelector(".clickedTableRow");
            if (previouslyClickedRow) {
                previouslyClickedRow.classList.remove("clickedTableRow");
            }

            // Uncheck all checkboxes in each row of the specified table
            const checkboxes = table.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false; // Uncheck the checkbox
            });
        }
    }

    if(ifAlert == "YES") {
        showNotification(`Form cleared, row deselected, and checkboxes unchecked!`);
    }
}

/*============================================================*/

function formValidity(formId, excludeIds = []) {
    // Get form element
    const selectedForm = document.getElementById(formId);
    const formElements = selectedForm.elements; // Get all form elements

    // Check validity for all form elements except those in the excludeIds
    for (const element of formElements) {
        if (!excludeIds.includes(element.id) && !element.checkValidity()) {
            element.reportValidity(); // Show browser validation message
            return false; // Prevent further execution if any field is invalid
        }
    }

    return true; // All fields are valid
}

/*============================================================*/

function highlightClickedTableRow(tableId, row) {
    // Get the table by the provided tableId
    const table = document.getElementById(tableId);

    // Check if the clicked row already has the class
    if (row.classList.contains("clickedTableRow")) {
        // If it does, remove the class
        row.classList.remove("clickedTableRow");

        // Construct the form ID by replacing "-table" with "-form"
        const formId = tableId.replace("-table", "-form");
        clearFormFields(tableId,formId);
    } else {
        // Find the previously clicked row within the specified table
        const previouslyClickedRow = table.querySelector(".clickedTableRow");
        if (previouslyClickedRow) {
            previouslyClickedRow.classList.remove("clickedTableRow");
        }

        // Add "clickedTableRow" class to the currently clicked row
        row.classList.add("clickedTableRow");
    }
}

/*============================================================*/

function showNotification(message) {
    const container = document.getElementById('notification-container');

    // Check if there is an existing notification
    const existingNotification = container.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove(); // Remove it if found
    }

    // Create the new notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Append the notification to the container
    container.appendChild(notification);

    // Start the slide-in animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Automatically remove the notification after 3.5 seconds
    setTimeout(() => {
        notification.classList.remove('show'); // Trigger slide-out
        setTimeout(() => notification.remove(), 600); // Wait for slide-out to complete
    }, 3500);
}

/*============================================================*/

function repopulateComboBoxFromTable(tableID, dataName, comboBoxID) {
    // Get the table and combo box elements
    const table = document.getElementById(tableID);
    const comboBox = document.getElementById(comboBoxID);

    // Remove all options from the combo box except the first one (index 0)
    while (comboBox.options.length > 1) {
        comboBox.remove(1);  // Remove from index 1 onwards, keeping index 0
    }

    // Get all rows in the table body
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        // Access the data stored in the row's custom attribute
        const rowData = JSON.parse(row.getAttribute(dataName));

        // Assuming rowData is an array with the ID at index 0 and name at index 1
        const IDForValue = rowData.id; 
        const valueToAdd = rowData.name;

        // Add new option to the combo box
        comboBox.add(new Option(valueToAdd, IDForValue));
    });
}

/*============================================================*/

function sortTableByColumn(tableId, selectId, button, buttonClicked) {
    const table = document.getElementById(tableId);
    const select = document.getElementById(selectId);
    const selectedColumnIndex = select.value;  // Get the selected column index from the dropdown
    let symbol = button.textContent.trim();  // Get the symbol from the button's text content

    let ascending;

    if (buttonClicked === "YES") {
        // Toggle the button symbol and determine the sort order
        if (symbol === '🡹') {
            button.textContent = '🡻';
            ascending = false;
        } else {
            button.textContent = '🡹';
            ascending = true;
        }
    } else {
        // Do not change the symbol, just determine the sort order from the current symbol
        ascending = (symbol === '🡹');
    }

    // const tbody = table.querySelector("tbody");
    // const rows = Array.from(tbody.querySelectorAll("tr")); // Get all rows in the tbody

    // // Sort the rows based on the text content of the selected column
    // rows.sort((rowA, rowB) => {
    //     const cellA = rowA.cells[selectedColumnIndex].textContent.trim().toLowerCase();
    //     const cellB = rowB.cells[selectedColumnIndex].textContent.trim().toLowerCase();

    //     if (!isNaN(cellA) && !isNaN(cellB)) {
    //         // Sort numerically if both values are numbers
    //         return ascending ? cellA - cellB : cellB - cellA;
    //     }

    //     if (cellA < cellB) {
    //         return ascending ? -1 : 1;
    //     }
    //     if (cellA > cellB) {
    //         return ascending ? 1 : -1;
    //     }
    //     return 0;
    // });

    // // Reorder the rows in the tbody
    // rows.forEach(row => tbody.appendChild(row));
}

/*============================================================*/

 // Generalized toggle function
 function toggleInputField(button, inputID) {
    const inputField = document.getElementById(inputID);
    
    inputField.disabled = !inputField.disabled; // Toggle the disabled state
    inputField.value = '';
    button.textContent = inputField.disabled ? 'Fill Form with ID' : 'Disable ID Input'; // Update button text
}

/*============================================================*/

function fillForm(inputID, tableID, dataName, formID) {
    // Find the input element
    const inputElement = document.getElementById(inputID);
    
    // Check if the input element exists
    if (!inputElement) {
        console.error(`Input element with ID '${inputID}' not found.`);
        return; // Exit the function if the input element is not found
    }

    const inputValue = inputElement.value.trim(); // Trim any extra spaces
    const originalValue = inputValue; // Save the original value of the ID input

    // Click the closest "Clear Form" button if input is invalid
    if (!inputValue || isNaN(inputValue)) {
        console.warn(`Invalid input: '${inputValue}'. Clicking Clear Form.`);
        const clearButton = Array.from(inputElement.closest('.container').querySelectorAll('button'))
            .find(button => button.textContent.trim() === "Clear Form");
        
        if (clearButton) {
            console.log("Clicking the Clear Form button."); // Debugging log
            clearButton.click(); // Click the clear button
        } else {
            console.warn("Clear Form button not found."); // Debugging log
        }
        showNotification(`Please enter a valid numeric ID to auto-fill the form.`);
        inputElement.value = originalValue; // Restore the original value
        return;
    }

    const table = document.getElementById(tableID);
    const rows = table.querySelectorAll("tbody tr");

    // Click the closest "Clear Form" button if no rows are found
    if (rows.length === 0) {
        console.warn(`No rows found in the table. Clicking Clear Form.`);
        const clearButton = Array.from(inputElement.closest('.container').querySelectorAll('button'))
            .find(button => button.textContent.trim() === "Clear Form");
        
        if (clearButton) {
            console.log("Clicking the Clear Form button."); // Debugging log
            clearButton.click(); // Click the clear button
        } else {
            console.warn("Clear Form button not found."); // Debugging log
        }
        showNotification(`There are no rows to search in the table.`);
        inputElement.value = originalValue; // Restore the original value
        return;
    }

    let found = false;
    rows.forEach(row => {
        try {
            const rowData = JSON.parse(row.getAttribute(`data-${dataName}`)); // Parse data-stock
            
            // Ensure both values are of the same type
            if (String(rowData.id) === inputValue) {
                if (row.classList.contains("clickedTableRow")) {
                    showNotification(`Form is already filled with ID: '${inputValue}'`);
                    found = true;
                    return;
                }

                row.click(); // Programmatically click the row
                showNotification(`Form filled with ID: '${inputValue}'`);
                found = true;
            }
        } catch (error) {
            console.error("Error parsing row data:", error);
        }
    });

    // Click the closest "Clear Form" button if no record is found
    if (!found) {
        console.warn(`No existing record with the ID: '${inputValue}'. Clicking Clear Form.`);
        const clearButton = Array.from(inputElement.closest('.container').querySelectorAll('button'))
            .find(button => button.textContent.trim() === "Clear Form");
        
        if (clearButton) {
            console.log("Clicking the Clear Form button."); // Debugging log
            clearButton.click(); // Click the clear button
        } else {
            console.warn("Clear Form button not found."); // Debugging log
        }
        showNotification(`No existing record with the ID: '${inputValue}'`);
    }

    // Restore the original value after clearing
    inputElement.value = originalValue; // Restore the original value
}

/*============================================================*/

function setComboBoxValue(comboBoxId, valueToMatch) {
    const comboBox = document.getElementById(comboBoxId);
    const options = comboBox.options;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].textContent === valueToMatch) {
            comboBox.selectedIndex = i;
            return;
        }
    }
}

/*============================================================*/

function getSelectedComboBoxText(comboBoxId) {
    const comboBox = document.getElementById(comboBoxId);
    return comboBox.options[comboBox.selectedIndex].textContent;
}

/*============================================================*/

function animateRowHighlight(row) {
    row.classList.add("highlight-animation");
    row.focus()
    setTimeout(() => row.classList.remove("highlight-animation"), 2000);
}

/*============================================================*/

// Function to show the modal
function openModal(modalID) {
    const modal = document.getElementById(modalID);
    modal.style.display = "flex"; // Show modal using flex
}

// Function to close the modal
function closeModal(modalID) {
    const modal = document.getElementById(modalID);
    modal.style.display = "none"; // Hide the modal
}

/*============================================================*/

function formattedIngredientIDWithExtra(ingredientID,notInnerHTML) {
    const table = document.getElementById("ingredient-table");
    const rows = table.querySelectorAll("tbody tr");

    for (const row of rows) {
        const ingredientData = JSON.parse(row.getAttribute("data-ingredient"));

        if (ingredientData.id === ingredientID) {
            const { id, name, unit } = ingredientData;
            if(notInnerHTML) {
                return `[${id}] ${name} <br><small>(${unit})</small>`;
            } else {
                return `[${id}] ${name} (${unit})`;
            }
        }
    }
}

/*============================================================*/

function grabSpecificDataFromID(pageID, ID, dataAttributeName) {
    const table = document.getElementById(`${pageID}-table`);
    const rows = table.querySelectorAll("tbody tr");

    for (const row of rows) {
        const rowData = JSON.parse(row.getAttribute(`data-${pageID}`));

        if (rowData.id === ID) {
            // Use bracket notation to access the dynamic property
            return rowData[dataAttributeName];
        }
    }

    // Return null if no matching ID is found
    return null;
}

/*============================================================*/

// Function to update the badge count based on category ID
function updateBadge(ID, change) {
    const menuBtn = document.querySelector(`.verticalmenu-btn[id="${ID}"]`);
    
    if (menuBtn) { // Ensure the element is a vertical menu button
        const badge = menuBtn.querySelector('.notification-badge');
        let currentCount = parseInt(badge.textContent) || 0;

        currentCount += change; // Update the count based on the change
        badge.textContent = currentCount; // Set the new count

        // Show the badge if count is 1 or more, otherwise hide it
        badge.style.display = currentCount > 0 ? 'inline-block' : 'none';
    } else {
        console.warn(`No vertical menu button found with ID: ${ID}`);
    }
}

/*============================================================*/