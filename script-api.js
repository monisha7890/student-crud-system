// ============================================
// STUDENT MANAGEMENT SYSTEM - JAVASCRIPT
// API-based version with MySQL backend
// ============================================

const API_URL = 'http://localhost:5000/api';
const SUBJECTS = ['Telugu', 'English', 'Hindi', 'Sanskrit', 'Mathematics', 'Science', 'Social Studies'];

// ============================================
// API CALLS
// ============================================

// Get all students from API
async function getStudents() {
    try {
        const response = await fetch(`${API_URL}/students`);
        if (!response.ok) throw new Error('Failed to fetch students');
        return await response.json();
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

// Add a new student via API
async function addStudent(name) {
    try {
        if (!name.trim()) {
            showMessage('addStudentMessage', 'Student name cannot be empty!', 'error');
            return false;
        }

        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const error = await response.json();
            showMessage('addStudentMessage', error.error, 'error');
            return false;
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding student:', error);
        showMessage('addStudentMessage', 'Error adding student!', 'error');
        return false;
    }
}

// Add marks for a student via API
async function addMarks(rollNumber, marksArray) {
    try {
        const marksObj = {
            roll_number: rollNumber,
            telugu: marksArray[0],
            english: marksArray[1],
            hindi: marksArray[2],
            sanskrit: marksArray[3],
            mathematics: marksArray[4],
            science: marksArray[5],
            social_studies: marksArray[6]
        };

        const response = await fetch(`${API_URL}/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(marksObj)
        });

        if (!response.ok) {
            const error = await response.json();
            showMessage('addMarksMessage', error.error, 'error');
            return false;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding marks:', error);
        showMessage('addMarksMessage', 'Error adding marks!', 'error');
        return false;
    }
}

// Delete a student via API
async function deleteStudent(rollNumber) {
    try {
        const response = await fetch(`${API_URL}/students/${rollNumber}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete student');
        return await response.json();
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
}

// Search for a student via API
async function searchStudent(rollNumber) {
    try {
        const response = await fetch(`${API_URL}/search?rollNumber=${rollNumber}`);
        if (!response.ok) throw new Error('Student not found');
        return await response.json();
    } catch (error) {
        console.error('Error searching student:', error);
        return null;
    }
}

// Get dashboard statistics via API
async function getDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard-stats`);
        if (!response.ok) throw new Error('Failed to fetch statistics');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get total marks from marks array
function getTotalMarks(marks) {
    const values = Object.values(marks).filter(m => m >= 0);
    return values.reduce((a, b) => a + b, 0);
}

// Get percentage from marks
function getPercentage(marks) {
    const values = Object.values(marks).filter(m => m >= 0);
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 100)) * 100);
}

// Get grade based on percentage
function getGrade(percentage) {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 36) return 'E';
    return 'F';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message alerts
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `message show ${type}`;
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// ============================================
// UI DISPLAY FUNCTIONS
// ============================================

// Update student dropdown
async function updateStudentDropdown() {
    const students = await getStudents();
    const select = document.getElementById('studentSelect');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Select a student --</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.roll_number;
        option.textContent = `Roll #${student.roll_number} - ${student.name}`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

// Display all students
async function displayStudents() {
    const students = await getStudents();
    const container = document.getElementById('studentsList');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-message">No students found. Add a student to get started!</p>';
        return;
    }
    
    let html = '';
    students.forEach(student => {
        const hasMarks = student.telugu !== null && student.telugu !== -1;
        const marks = {
            telugu: student.telugu || -1,
            english: student.english || -1,
            hindi: student.hindi || -1,
            sanskrit: student.sanskrit || -1,
            mathematics: student.mathematics || -1,
            science: student.science || -1,
            social_studies: student.social_studies || -1
        };
        
        const totalMarks = hasMarks ? getTotalMarks(marks) : 0;
        const percentage = hasMarks ? getPercentage(marks) : 0;
        const overallGrade = hasMarks ? getGrade(percentage) : '--';
        
        html += `
            <div class="student-card">
                <div class="student-header">
                    <h3>${escapeHtml(student.name)}</h3>
                    <span class="roll-number">Roll #${student.roll_number}</span>
                </div>
                
                ${hasMarks ? `
                    <div class="student-marks-summary">
                        <div class="summary-stat">
                            <span class="stat-label">Total Marks</span>
                            <span class="stat-value">${totalMarks}/700</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Percentage</span>
                            <span class="stat-value">${percentage}%</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Grade</span>
                            <span class="stat-value"><span class="grade-badge ${overallGrade.toLowerCase()}">${overallGrade}</span></span>
                        </div>
                    </div>
                    
                    <div class="subject-marks-mini">
                        <div class="mini-subject"><strong>Tel:</strong> ${marks.telugu}</div>
                        <div class="mini-subject"><strong>Eng:</strong> ${marks.english}</div>
                        <div class="mini-subject"><strong>Hin:</strong> ${marks.hindi}</div>
                        <div class="mini-subject"><strong>San:</strong> ${marks.sanskrit}</div>
                        <div class="mini-subject"><strong>Math:</strong> ${marks.mathematics}</div>
                        <div class="mini-subject"><strong>Sci:</strong> ${marks.science}</div>
                        <div class="mini-subject"><strong>Soc:</strong> ${marks.social_studies}</div>
                    </div>
                ` : `
                    <div class="no-marks-message">
                        ⚠ Marks not yet entered for this student
                    </div>
                `}
                
                <div class="student-actions">
                    <button class="btn btn-secondary btn-small" onclick="searchStudentById(${student.roll_number})">View</button>
                    <button class="btn btn-danger btn-small" onclick="confirmDelete(${student.roll_number}, '${escapeHtml(student.name)}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update dashboard
async function updateDashboard() {
    const stats = await getDashboardStats();
    
    if (!stats) {
        console.error('Failed to load dashboard stats');
        return;
    }
    
    document.getElementById('totalStudents').textContent = stats.totalStudents;
    document.getElementById('avgPercentage').textContent = stats.averagePercentage;
    document.getElementById('highestAvg').textContent = stats.highestAverage;
    document.getElementById('passedCount').textContent = stats.passedCount;
    document.getElementById('failedCount').textContent = stats.failedCount;
    
    // Update grade distribution
    document.getElementById('gradeO').textContent = stats.gradeDistribution.O || 0;
    document.getElementById('gradeA').textContent = stats.gradeDistribution.A || 0;
    document.getElementById('gradeB').textContent = stats.gradeDistribution.B || 0;
    document.getElementById('gradeC').textContent = stats.gradeDistribution.C || 0;
    document.getElementById('gradeD').textContent = stats.gradeDistribution.D || 0;
    document.getElementById('gradeE').textContent = stats.gradeDistribution.E || 0;
    document.getElementById('gradeF').textContent = stats.gradeDistribution.F || 0;
}

// Update marks summary
function updateMarksSummary() {
    let totalMarks = 0;
    const marksArray = [];
    
    document.querySelectorAll('.subject-marks').forEach((input, index) => {
        const value = input.value !== '' ? parseInt(input.value) : -1;
        marksArray.push(value);
        if (value >= 0) totalMarks += value;
    });
    
    const percentage = getPercentage(marksArray);
    const grade = getGrade(percentage);
    
    document.getElementById('totalMarks').textContent = totalMarks;
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('overallGrade').textContent = grade;
    document.getElementById('overallGrade').className = `grade-badge ${grade.toLowerCase()}`;
}

// Search student by ID
async function searchStudentById(rollNumber) {
    const student = await searchStudent(rollNumber);
    if (!student) {
        showMessage('searchResult', 'Student not found!', 'not-found');
        return;
    }
    
    const hasMarks = student.telugu !== null && student.telugu !== -1;
    let html = `<div class="search-result found">
                <div class="result-item">
                    <span class="result-label">Name:</span> ${escapeHtml(student.name)}
                </div>
                <div class="result-item">
                    <span class="result-label">Roll Number:</span> ${student.roll_number}
                </div>`;
    
    if (hasMarks) {
        const marks = {
            telugu: student.telugu || -1,
            english: student.english || -1,
            hindi: student.hindi || -1,
            sanskrit: student.sanskrit || -1,
            mathematics: student.mathematics || -1,
            science: student.science || -1,
            social_studies: student.social_studies || -1
        };
        
        const totalMarks = getTotalMarks(marks);
        const percentage = getPercentage(marks);
        const grade = getGrade(percentage);
        
        html += `
            <div class="search-marks-table">
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Telugu</td><td>${marks.telugu}</td></tr>
                        <tr><td>English</td><td>${marks.english}</td></tr>
                        <tr><td>Hindi</td><td>${marks.hindi}</td></tr>
                        <tr><td>Sanskrit</td><td>${marks.sanskrit}</td></tr>
                        <tr><td>Mathematics</td><td>${marks.mathematics}</td></tr>
                        <tr><td>Science</td><td>${marks.science}</td></tr>
                        <tr><td>Social Studies</td><td>${marks.social_studies}</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="search-summary">
                <p><strong>Total Marks:</strong> ${totalMarks}/700</p>
                <p><strong>Percentage:</strong> ${percentage}%</p>
                <p><strong>Grade:</strong> <span class="grade-badge ${grade.toLowerCase()}">${grade}</span></p>
            </div>
        `;
    } else {
        html += `<div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 6px; color: #92400e;">
                    ⚠ Marks not yet entered
                </div>`;
    }
    
    html += '</div>';
    document.getElementById('searchResult').innerHTML = html;
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(section).classList.add('active');
            this.classList.add('active');
        });
    });

    // Add Student Form
    document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('studentName').value;
        const result = await addStudent(name);
        
        if (result) {
            const message = `✓ Student added successfully!\nName: ${result.name}\nRoll Number: ${result.roll_number}`;
            showMessage('addStudentMessage', message, 'success');
            document.getElementById('studentName').value = '';
            
            const newStudentInfo = document.getElementById('newStudentInfo');
            newStudentInfo.innerHTML = `
                <div class="new-student-card">
                    <p>✓ <strong>${escapeHtml(result.name)}</strong> added with Roll Number <strong>${result.roll_number}</strong></p>
                </div>
            `;
            
            updateStudentDropdown();
            displayStudents();
            updateDashboard();
        }
    });

    // Student Selection for Marks
    document.getElementById('studentSelect').addEventListener('change', async function() {
        if (this.value) {
            const rollNumber = parseInt(this.value);
            const response = await fetch(`${API_URL}/students/${rollNumber}`);
            const student = await response.json();
            
            if (student && (student.telugu !== null || student.english !== null)) {
                showMessage('addMarksMessage', `⚠ Marks already exist for ${student.name} and cannot be changed!`, 'error');
                document.getElementById('addMarksForm').style.display = 'none';
                this.value = '';
            } else {
                document.getElementById('addMarksForm').style.display = 'block';
                document.querySelectorAll('.subject-marks').forEach(input => {
                    input.value = '';
                });
                updateMarksSummary();
            }
        } else {
            document.getElementById('addMarksForm').style.display = 'none';
        }
    });
    
    // Marks input listeners
    document.querySelectorAll('.subject-marks').forEach(input => {
        input.addEventListener('input', updateMarksSummary);
    });
    
    // Add Marks Form
    document.getElementById('addMarksForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rollNumber = parseInt(document.getElementById('studentSelect').value);
        const marksArray = [];
        
        document.querySelectorAll('.subject-marks').forEach((input, index) => {
            const value = input.value !== '' ? parseInt(input.value) : -1;
            if (value > 100 || (value < 0 && value !== -1)) {
                showMessage('addMarksMessage', `Invalid marks for ${SUBJECTS[index]}!`, 'error');
                return;
            }
            marksArray.push(value);
        });
        
        const result = await addMarks(rollNumber, marksArray);
        if (result && result.percentage !== undefined) {
            const percentage = result.percentage;
            const grade = result.grade;
            const totalMarks = marksArray.reduce((a, b) => a + b, 0);
            
            const confirmationMsg = `✓ Marks saved successfully!\nTotal: ${totalMarks}/700 | Percentage: ${percentage}% | Grade: ${grade}`;
            showMessage('addMarksMessage', confirmationMsg, 'success');
            
            document.getElementById('studentSelect').value = '';
            document.getElementById('addMarksForm').style.display = 'none';
            
            displayStudents();
            updateDashboard();
        }
    });

    // Search Form
    document.getElementById('searchBtn').addEventListener('click', async function() {
        const rollNumber = document.getElementById('searchInput').value;
        if (rollNumber) {
            await searchStudentById(parseInt(rollNumber));
        }
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('searchBtn').click();
        }
    });

    // ============================================
    // INTERACTIVE BUTTON ENHANCEMENTS
    // ============================================

    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initial load
    displayStudents();
    updateDashboard();
    updateStudentDropdown();
});

// Delete confirmation
function confirmDelete(rollNumber, name) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        deleteStudent(rollNumber).then(() => {
            showMessage('addStudentMessage', `✓ Student ${name} deleted successfully!`, 'success');
            displayStudents();
            updateStudentDropdown();
            updateDashboard();
        });
    }
}
