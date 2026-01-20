let selectedImg = null;
const EditPic = document.getElementById('EditPic');
let profileImg = document.getElementsByClassName('profileImg')[0];
EditPic.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profileImg.src = e.target.result;
            selectedImg = file;
        };
        reader.readAsDataURL(file);
    }
});
const toggle = document.getElementById('twoFA');
toggle.addEventListener('change', function () {
    if (this.checked) {
        console.log('2FA is Enable');
    } else {

        console.log('2FA is Disable');

    }
})
function saveChanges() {
    if (selectedImg) {
        alert("The Profile Image is Saved !");
    } else {
        alert('No Picture Added !');

    }
}

// Sample realistic data
const medicalData = {
    // Age distribution data (realistic for medical facility)
    ageGroups: {
        labels: ['0-12 (Children)', '13-18 (Teens)', '19-30 (Young Adults)', 
                 '31-45 (Adults)', '46-60 (Middle Age)', '61+ (Seniors)'],
        data: [280, 195, 420, 385, 290, 175], // Total = 1745
        colors: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(153, 102, 255, 0.8)'
        ]
    },
    
    // Monthly patient data for different years
    monthlyPatients: {
        '2025': [125, 142, 158, 145, 162, 178, 192, 205, 188, 175, 160, 148],
        '2024': [110, 128, 140, 135, 148, 162, 175, 185, 170, 158, 145, 130],
        '2023': [95, 112, 125, 118, 132, 145, 158, 168, 155, 142, 130, 115]
    }
};

// Chart instances
let patientChart, consultationChart;
let currentAgeChartType = 'bar';
let currentYear = '2025';

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAgeChart();
    initializeMonthlyChart();
    updateDashboardStats();
    
    // Add event listeners for controls
    document.getElementById('ageChartType').addEventListener('change', function() {
        currentAgeChartType = this.value;
        initializeAgeChart();
    });
    
    document.getElementById('yearSelect').addEventListener('change', function() {
        currentYear = this.value;
        initializeMonthlyChart();
    });
});

// Function to initialize Age Distribution Chart
function initializeAgeChart() {
    const ctx = document.getElementById('patientChart');
    
    // Destroy existing chart if it exists
    if (patientChart) {
        patientChart.destroy();
    }
    
    // Calculate statistics
    const totalPatients = medicalData.ageGroups.data.reduce((a, b) => a + b, 0);
    const maxAgeGroup = medicalData.ageGroups.data.indexOf(Math.max(...medicalData.ageGroups.data));
    const avgPatientsPerGroup = (totalPatients / medicalData.ageGroups.data.length).toFixed(1);
    
    // Chart configuration
    const chartConfig = {
        type: currentAgeChartType,
        data: {
            labels: medicalData.ageGroups.labels,
            datasets: [{
                label: 'Number of Patients',
                data: medicalData.ageGroups.data,
                backgroundColor: medicalData.ageGroups.colors,
                borderColor: medicalData.ageGroups.colors.map(color => color.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalPatients) * 100).toFixed(1);
                            return `${value} patients (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Total Patients: ${totalPatients.toLocaleString()}`,
                    position: 'top',
                    font: {
                        size: 14
                    }
                }
            },
            scales: currentAgeChartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Patients',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 50
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Age Groups',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            } : {}
        }
    };
    
    // Create chart
    patientChart = new Chart(ctx, chartConfig);
    
    // Update legend
    updateAgeLegend();
    
    // Update summary statistics
    updateAgeSummary(totalPatients, maxAgeGroup, avgPatientsPerGroup);
}

// Function to initialize Monthly Patient Chart
function initializeMonthlyChart() {
    const ctx = document.getElementById('consultationChart');
    const chartType = document.getElementById('monthChartType').value;
    
    // Destroy existing chart if it exists
    if (consultationChart) {
        consultationChart.destroy();
    }
    
    const monthlyData = medicalData.monthlyPatients[currentYear];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate statistics
    const totalYearly = monthlyData.reduce((a, b) => a + b, 0);
    const averageMonthly = (totalYearly / 12).toFixed(1);
    const maxMonth = monthlyData.indexOf(Math.max(...monthlyData));
    const minMonth = monthlyData.indexOf(Math.min(...monthlyData));
    const growth = (((monthlyData[11] - monthlyData[0]) / monthlyData[0]) * 100).toFixed(1);
    
    // Chart configuration
    const chartConfig = {
        type: chartType,
        data: {
            labels: months,
            datasets: [{
                label: 'Patients Registered',
                data: monthlyData,
                backgroundColor: chartType === 'bar' 
                    ? 'rgba(54, 162, 235, 0.7)'
                    : 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: chartType === 'line' ? 3 : 1,
                tension: chartType === 'line' ? 0.4 : 0,
                fill: chartType === 'line',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} patients`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Year ${currentYear} - Total: ${totalYearly.toLocaleString()} patients`,
                    position: 'top',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Patients',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 25
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Months',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    };
    
    // Create chart
    consultationChart = new Chart(ctx, chartConfig);
    
    // Update legend
    updateMonthlyLegend(chartType);
    
    // Update summary statistics
    updateMonthlySummary(totalYearly, averageMonthly, maxMonth, minMonth, growth);
}

// Update Age Chart Legend
function updateAgeLegend() {
    const container = document.getElementById('patientLegend');
    container.innerHTML = '';
    
    medicalData.ageGroups.labels.forEach((label, index) => {
        const value = medicalData.ageGroups.data[index];
        const percentage = ((value / medicalData.ageGroups.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = medicalData.ageGroups.colors[index];
        
        const text = document.createElement('span');
        text.innerHTML = `<strong>${label}:</strong> ${value} (${percentage}%)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(text);
        container.appendChild(legendItem);
    });
}

// Update Monthly Chart Legend
function updateMonthlyLegend(chartType) {
    const container = document.getElementById('monthlyLegend');
    container.innerHTML = '';
    
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    
    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = chartType === 'bar' 
        ? 'rgba(54, 162, 235, 0.7)'
        : 'rgba(54, 162, 235, 1)';
    
    const text = document.createElement('span');
    text.innerHTML = `<strong>Patient Registrations (${currentYear})</strong>`;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(text);
    container.appendChild(legendItem);
}

// Update Age Summary Statistics
function updateAgeSummary(total, maxIndex, average) {
    const container = document.getElementById('ageSummary');
    const maxGroup = medicalData.ageGroups.labels[maxIndex].split(' ')[0];
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${total.toLocaleString()}</div>
            <div class="stat-label">Total Patients</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${maxGroup}</div>
            <div class="stat-label">Largest Group</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${average}</div>
            <div class="stat-label">Avg per Group</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">6</div>
            <div class="stat-label">Age Groups</div>
        </div>
    `;
}

// Update Monthly Summary Statistics
function updateMonthlySummary(total, average, maxMonth, minMonth, growth) {
    const container = document.getElementById('monthlySummary');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${total.toLocaleString()}</div>
            <div class="stat-label">Year Total</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${average}</div>
            <div class="stat-label">Monthly Avg</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${months[maxMonth]}</div>
            <div class="stat-label">Peak Month</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${growth}%</div>
            <div class="stat-label">Year Growth</div>
        </div>
    `;
}

// Update Dashboard Statistics (connect with charts)
function updateDashboardStats() {
    const totalPatients = medicalData.ageGroups.data.reduce((a, b) => a + b, 0);
    const currentMonthPatients = medicalData.monthlyPatients['2025'][new Date().getMonth()];
    
    // Update dashboard cards
    document.querySelector('.card:nth-child(1) .cardHead h4').textContent = 
        totalPatients.toLocaleString();
    document.querySelector('.card:nth-child(3) .cardDescription p').textContent = 
        currentMonthPatients;
    
    // Calculate alerts based on data anomalies
    const monthlyAvg = medicalData.monthlyPatients['2025'].reduce((a, b) => a + b, 0) / 12;
    const currentMonth = new Date().getMonth();
    const deviation = Math.abs(currentMonthPatients - monthlyAvg) / monthlyAvg * 100;
    
    let alerts = 0;
    if (deviation > 20) alerts++;
    if (medicalData.ageGroups.data[0] > 300) alerts++; // Too many children
    if (medicalData.ageGroups.data[5] < 100) alerts++; // Too few seniors
    
    document.querySelector('.card:nth-child(4) .cardDescription p').textContent = alerts;
}

// Export Age Data as CSV
function downloadAgeData() {
    let csvContent = "Age Group,Patient Count,Percentage\n";
    
    medicalData.ageGroups.labels.forEach((label, index) => {
        const value = medicalData.ageGroups.data[index];
        const total = medicalData.ageGroups.data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(2);
        csvContent += `${label},${value},${percentage}%\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_age_distribution_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('Age data exported successfully!', 'success');
}

// Update both charts
function updateCharts() {
    // Simulate data update (in real app, this would fetch from API)
    medicalData.ageGroups.data = medicalData.ageGroups.data.map(value => 
        Math.max(50, value + Math.floor(Math.random() * 40) - 20)
    );
    
    initializeAgeChart();
    updateDashboardStats();
    showNotification('Charts updated with latest data!', 'info');
}

// Update only monthly chart
function updateMonthlyChart() {
    const chartType = document.getElementById('monthChartType').value;
    currentYear = document.getElementById('yearSelect').value;
    
    // Simulate data variation
    if (Math.random() > 0.5) {
        medicalData.monthlyPatients[currentYear] = 
            medicalData.monthlyPatients[currentYear].map(value => 
                Math.max(80, value + Math.floor(Math.random() * 30) - 15)
            );
    }
    
    initializeMonthlyChart();
    showNotification(`Monthly chart updated for ${currentYear}!`, 'info');
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
function simulateNewData() {
    // Simulate new patients
    const newPatients = Math.floor(Math.random() * 50) + 20;
    
    // Distribute new patients across age groups
    const distribution = [0.15, 0.1, 0.25, 0.22, 0.18, 0.1]; // Percentage distribution
    
    medicalData.ageGroups.data = medicalData.ageGroups.data.map((value, index) => 
        value + Math.round(newPatients * distribution[index])
    );
    
    // Update current month's data
    const currentMonth = new Date().getMonth();
    medicalData.monthlyPatients['2025'][currentMonth] += newPatients;
    
    // Update charts
    initializeAgeChart();
    initializeMonthlyChart();
    updateDashboardStats();
    
    showNotification(`Added ${newPatients} new patients this month!`, 'success');
    
    // Update alert if needed
    if (newPatients > 100) {
        document.querySelector('.card:nth-child(4) .cardDescription p').textContent = 
            parseInt(document.querySelector('.card:nth-child(4) .cardDescription p').textContent) + 1;
    }
}
// User data
const usersData = [
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@email.com",
        role: "Patient",
        registrationDate: "2025-01-15",
        lastLogin: "2025-01-18",
        activation: "Active",
        status: "active"
    },
    {
        id: 2,
        name: "Dr. Sarah Johnson",
        email: "sarah.j@hospital.com",
        role: "Doctor",
        registrationDate: "2025-01-10",
        lastLogin: "2025-01-19",
        activation: "Active",
        status: "active"
    },
    {
        id: 3,
        name: "Michael Chen",
        email: "m.chen@email.com",
        role: "Patient",
        registrationDate: "2025-01-05",
        lastLogin: "2025-01-12",
        activation: "Pending",
        status: "pending"
    },
    {
        id: 4,
        name: "Dr. Robert Williams",
        email: "r.williams@clinic.com",
        role: "Doctor",
        registrationDate: "2024-12-20",
        lastLogin: "2025-01-17",
        activation: "Active",
        status: "active"
    },
    {
        id: 5,
        name: "Emily Davis",
        email: "emily.d@email.com",
        role: "Nurse",
        registrationDate: "2024-12-15",
        lastLogin: "2025-01-16",
        activation: "Inactive",
        status: "inactive"
    },
    {
        id: 6,
        name: "David Wilson",
        email: "d.wilson@email.com",
        role: "Patient",
        registrationDate: "2024-12-10",
        lastLogin: "2024-12-28",
        activation: "Active",
        status: "active"
    },
    {
        id: 7,
        name: "Dr. Lisa Anderson",
        email: "l.anderson@medical.com",
        role: "Doctor",
        registrationDate: "2024-12-05",
        lastLogin: "2025-01-19",
        activation: "Active",
        status: "active"
    },
    {
        id: 8,
        name: "Maria Garcia",
        email: "m.garcia@email.com",
        role: "Patient",
        registrationDate: "2024-11-28",
        lastLogin: "2025-01-10",
        activation: "Pending",
        status: "pending"
    },
    {
        id: 9,
        name: "Dr. James Brown",
        email: "j.brown@clinic.com",
        role: "Doctor",
        registrationDate: "2024-11-20",
        lastLogin: "2025-01-18",
        activation: "Active",
        status: "active"
    },
    {
        id: 10,
        name: "Jennifer Miller",
        email: "j.miller@email.com",
        role: "Patient",
        registrationDate: "2024-11-15",
        lastLogin: "2025-01-05",
        activation: "Inactive",
        status: "inactive"
    }
];

// Table state
let currentPage = 1;
const itemsPerPage = 7;
let filteredUsers = [...usersData];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    setupSearch();
    setupTableSorting();
});

// Load users into table
function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (currentUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">No users found</td>
            </tr>
        `;
        return;
    }
    
    // Add users to table
    currentUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background-color: ${getAvatarColor(user.name)};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    ">
                        ${getInitials(user.name)}
                    </div>
                    <div>
                        <div style="font-weight: bold;">${user.name}</div>
                        <div style="font-size: 0.8rem; color: #666;">${user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span style="
                    background-color: ${getRoleColor(user.role)};
                    color: white;
                    padding: 5px 15px;
                    border-radius: 15px;
                    font-size: 0.9rem;
                ">
                    ${user.role}
                </span>
            </td>
            <td>
                <div style="font-weight: bold;">${formatDate(user.registrationDate)}</div>
                <div style="font-size: 0.8rem; color: #666;">
                    Last login: ${formatDate(user.lastLogin)}
                </div>
            </td>
            <td>
                <span class="status-badge ${getActivationClass(user.activation)}">
                    ${user.activation}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.status === 'active' ? 'status-active' : user.status === 'pending' ? 'status-pending' : 'status-inactive'}">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            </td>
        `;
        
        // Add click event for user details
        row.addEventListener('click', () => showUserDetails(user));
        row.style.cursor = 'pointer';
        
        tableBody.appendChild(row);
    });
    
    // Update pagination
    updatePagination();
    
    // Show notification
    showTableNotification(`Loaded ${currentUsers.length} users`);
}

// Setup search functionality
function setupSearch() {
    const searchBox = document.getElementById('userSearch');
    
    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm.length === 0) {
            filteredUsers = [...usersData];
        } else {
            filteredUsers = usersData.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm)
            );
        }
        
        currentPage = 1;
        loadUsers();
    });
}

// Setup table sorting
function setupTableSorting() {
    const headers = document.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable(index);
        });
        header.style.cursor = 'pointer';
        header.title = 'Click to sort';
    });
}

// Sort table by column
function sortTable(columnIndex) {
    const header = document.querySelectorAll('thead th')[columnIndex];
    const isAscending = !header.classList.contains('sorted-asc');
    
    // Remove sort classes
    document.querySelectorAll('thead th').forEach(h => {
        h.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Add sort class
    header.classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');
    
    // Sort users
    filteredUsers.sort((a, b) => {
        let valueA, valueB;
        
        switch(columnIndex) {
            case 0: // Name
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case 1: // Role
                valueA = a.role.toLowerCase();
                valueB = b.role.toLowerCase();
                break;
            case 2: // Date
                valueA = new Date(a.registrationDate);
                valueB = new Date(b.registrationDate);
                break;
            case 3: // Activation
                valueA = a.activation.toLowerCase();
                valueB = b.activation.toLowerCase();
                break;
            case 4: // Status
                valueA = a.status.toLowerCase();
                valueB = b.status.toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (valueA < valueB) return isAscending ? -1 : 1;
        if (valueA > valueB) return isAscending ? 1 : -1;
        return 0;
    });
    
    loadUsers();
}

// Update pagination
function updatePagination() {
    const paginationDiv = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
        ">
    `;
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}
                style="
                    padding: 8px 15px;
                    border: 1px solid var(--navcolor);
                    background-color: ${currentPage === 1 ? '#e9ecef' : 'white'};
                    border-radius: 5px;
                    cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};
                    color: ${currentPage === 1 ? '#6c757d' : 'var(--Paraghfont)'};
                ">
            ← Previous
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <button style="
                    padding: 8px 15px;
                    background-color: var(--navcolor);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                ">
                    ${i}
                </button>
            `;
        } else if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `
                <button onclick="changePage(${i})"
                        style="
                            padding: 8px 15px;
                            border: 1px solid var(--navcolor);
                            background-color: white;
                            border-radius: 5px;
                            cursor: pointer;
                            color: var(--Paraghfont);
                        ">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}
                style="
                    padding: 8px 15px;
                    border: 1px solid var(--navcolor);
                    background-color: ${currentPage === totalPages ? '#e9ecef' : 'white'};
                    border-radius: 5px;
                    cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};
                    color: ${currentPage === totalPages ? '#6c757d' : 'var(--Paraghfont)'};
                ">
            Next →
        </button>
    `;
    
    paginationHTML += `</div>`;
    paginationDiv.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadUsers();
    
    // Scroll to table
    document.getElementById('latestUser').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Helper functions
function getAvatarColor(name) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getRoleColor(role) {
    switch(role.toLowerCase()) {
        case 'doctor': return '#28a745';
        case 'nurse': return '#17a2b8';
        case 'admin': return '#dc3545';
        case 'patient': return '#007bff';
        default: return '#6c757d';
    }
}

function getActivationClass(activation) {
    switch(activation.toLowerCase()) {
        case 'active': return 'status-active';
        case 'pending': return 'status-pending';
        case 'inactive': return 'status-inactive';
        default: return '';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show user details modal
function showUserDetails(user) {
    // Create modal HTML
    const modalHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        " id="userModal">
            <div style="
                background-color: white;
                border-radius: 25px;
                padding: 30px;
                width: 500px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                ">
                    <h3 style="color: var(--navcolor);">User Details</h3>
                    <button onclick="closeModal()" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: var(--Paraghfont);
                    ">×</button>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        margin-bottom: 20px;
                    ">
                        <div style="
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            background-color: ${getAvatarColor(user.name)};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 2rem;
                            font-weight: bold;
                        ">
                            ${getInitials(user.name)}
                        </div>
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: var(--Paraghfont);">${user.name}</h4>
                            <p style="margin: 0; color: #666;">${user.email}</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">Role</label>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">${user.role}</p>
                        </div>
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">Status</label>
                            <p style="margin: 5px 0 0 0;">
                                <span class="status-badge ${user.status === 'active' ? 'status-active' : user.status === 'pending' ? 'status-pending' : 'status-inactive'}">
                                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">Registered On</label>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">${formatDate(user.registrationDate)}</p>
                        </div>
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">Last Login</label>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">${formatDate(user.lastLogin)}</p>
                        </div>
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">Account</label>
                            <p style="margin: 5px 0 0 0;">
                                <span class="status-badge ${getActivationClass(user.activation)}">
                                    ${user.activation}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label style="display: block; color: #666; font-size: 0.9rem;">User ID</label>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">#${String(user.id).padStart(4, '0')}</p>
                        </div>
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                ">
                    <button onclick="closeModal()" style="
                        padding: 10px 20px;
                        background-color: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                    ">
                        Close
                    </button>
                    <button onclick="editUser(${user.id})" style="
                        padding: 10px 20px;
                        background-color: var(--navcolor);
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                    ">
                        Edit User
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.remove();
    }
}

// Edit user
function editUser(userId) {
    alert(`Edit user with ID: ${userId}`);
    closeModal();
}

// Show notification
function showTableNotification(message) {
    console.log(`Table: ${message}`);
}
