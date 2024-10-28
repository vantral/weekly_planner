function startOfWeek(date)
{
  // Calculate the difference between the date's day of the month and its day of the week
  var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

  // Set the date to the start of the week by setting it to the calculated difference
  return new Date(date.setDate(diff));
}

dt = new Date()

// Set the current week start date
let currentWeekStart = new startOfWeek(dt); // Default to this week



// Helper function to format date as 'Month Day, Year'
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to fetch tasks for a specific week and update the planner view
function fetchWeekTasks(weekStartDate) {
    fetch('/get_week', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ week_start: formatDate(weekStartDate) })
    })
    .then(response => response.json())
    .then(data => {
        updatePlannerView(data, weekStartDate);  // Pass weekStartDate to the function
    })
    .catch(error => console.error('Error fetching week tasks:', error));
}

// Function to update the weekly planner view with fetched tasks and week start date
function updatePlannerView(tasks, weekStartDate) {
    const days = document.querySelectorAll('.day');
    days.forEach((day, index) => {
        // Calculate the current day based on weekStartDate and index
        const currentDayDate = new Date(weekStartDate);
        currentDayDate.setDate(weekStartDate.getDate() + index); // Update date based on index
        
        newDate = new Date(currentDayDate.valueOf())
        newDate.setDate(newDate.getDate() + 1)
        const dayId = `day-${newDate.toISOString().split('T')[0]}`; // New ID based on date
        
        day.setAttribute('id', dayId); // Update the ID of the day element

        const dayHeader = day.querySelector('h3');
        dayHeader.textContent = currentDayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // Update the header text

        const tasksContainer = day.querySelector('.tasks');
        tasksContainer.innerHTML = ''; // Clear existing tasks

        const dayStr = newDate.toISOString().split('T')[0]; // Format for task retrieval

        if (tasks[dayStr]) {
            tasks[dayStr].forEach(item => {
                const div = document.createElement('div');
                div.className = 'card mb3';
                const card = document.createElement('div');
                card.className = 'card-body';
                card.innerHTML = `
                    <h4 class="card-title">${item.title}</h4>
                    <p class="card-text">${item.details}</p>
                    <small class="text-muted">${item.time}</small>
                    <span class="badge badge-info">${item.type}</span>
                `;
                div.appendChild(card)
                tasksContainer.appendChild(div);
            });
        }
    });
}

// Event listeners for Previous and Next Week buttons
document.getElementById('prevWeek').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7); // Go back one week
    fetchWeekTasks(currentWeekStart);
});

document.getElementById('nextWeek').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7); // Go forward one week
    fetchWeekTasks(currentWeekStart);
});

// app.js
// document.querySelectorAll('.add-task').forEach(button => {
//     button.addEventListener('click', () => {
//         const day = button.getAttribute('data-day');
//         document.getElementById('date').value = day; // Set the hidden input for the date
//         $('#taskModal').modal('show'); // Show the task modal
//     });
// });

// document.getElementById('saveTask').addEventListener('click', () => {
//     const title = document.getElementById('taskTitle').value;
//     const details = document.getElementById('taskDetails').value;
//     const time = document.getElementById('taskTime').value;
//     const day = document.getElementById('taskDate').value;

//     if (title) {
//         // Make an AJAX call to add the task to the server here
//         console.log(`Adding task for ${day}: ${title}, ${details}, ${time}`);
        
//         // Reset form fields
//         document.getElementById('taskForm').reset();
//         $('#taskModal').modal('hide'); // Hide the modal after saving
//     }
// });

// Meeting Modal
// Show modal for adding a task
$('.add-task').on('click', function() {
    const selectedDate = $(this).data('day');
    console.log(selectedDate)
    $('#date').val(selectedDate); // Set the date in a hidden input
    $('#taskModal').modal('show'); // Show the modal
});

// Show modal for adding a meeting
$('.add-meeting').on('click', function() {
    const selectedDate = $(this).data('day');
    console.log(selectedDate)
    $('#meetingDate').val(selectedDate); // Set the date in a hidden input
    $('#meetingModal').modal('show'); // Show the modal
});

// Save task
$('#saveTask').on('click', function() {
    const title = $('#taskTitle').val();
    const details = $('#taskDetails').val();
    const time = $('#taskTime').val();
    const date = $('#taskDate').val();

    if (title) {
        // Make an AJAX call to save the task (replace '/add-task' with your endpoint)
        $.ajax({
            url: '/add-task',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ title, details, time, date }),
            success: function() {
                $('#taskModal').modal('hide');
                // Optionally refresh the planner view or update the UI accordingly
                fetchWeekTasks(currentWeekStart);
            }
        });
    }
});

// Save meeting
$('#saveMeeting').on('click', function() {
    const title = $('#meetingTitle').val();
    const details = $('#meetingDetails').val();
    const time = $('#meetingTime').val();
    const date = $('#meetingDate').val();

    if (title) {
        // Make an AJAX call to save the meeting (replace '/add-meeting' with your endpoint)
        $.ajax({
            url: '/add_task',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ title, details, time, date }),
            success: function() {
                $('#meetingModal').modal('hide');
                // Optionally refresh the planner view or update the UI accordingly
                fetchWeekTasks(currentWeekStart);
            }
        });
    }
});


// Initial load of tasks for the current week
fetchWeekTasks(currentWeekStart);
