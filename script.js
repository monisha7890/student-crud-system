// ============================================
// STUDENT MANAGEMENT SYSTEM - JAVASCRIPT
// ============================================

const STORAGE_KEY = 'students_system_data';
const SUBJECTS = ['Telugu', 'English', 'Hindi', 'Sanskrit', 'Mathematics', 'Science', 'Social Studies'];
const MAX_STUDENTS = 100;

// Get all students from localStorage
function getStudents() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save students to localStorage
function saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Add a new student (only name, auto-generate roll number)
function addStudent(name) {
    const students = getStudents();
    
    if (students.length >= MAX_STUDENTS) {
        showMessage('addStudentMessage', 'Storage is full! Cannot add more students.', 'error');
        return false;
    }
    
    if (!name.trim()) {
        showMessage('addStudentMessage', 'Student name cannot be empty!', 'error');
        return false;
    }
    
    const rollNumber = students.length + 1;
    
    students.push({
        rollNumber: rollNumber,
        name: name.trim(),
        marks: [-1, -1, -1, -1, -1, -1, -1] // -1 means not entered
    });
    
    saveStudents(students);
    return rollNumber;
}

// Add marks for a student
function addMarks(rollNumber, marksArray) {
    const students = getStudents();
    const index = students.findIndex(s => s.rollNumber === rollNumber);
    
    if (index === -1) {
        showMessage('addMarksMessage', 'Student not found!', 'error');
        return false;
    }
    
    // Check if student already has marks
    if (students[index].marks.some(m => m >= 0)) {
        showMessage('addMarksMessage', 'Marks already exist for this student and cannot be changed!', 'error');
        return false;
    }
    
    // Validate all marks
    for (let i = 0; i < marksArray.length; i++) {
        if (marksArray[i] < 0 || marksArray[i] > 100) {
            showMessage('addMarksMessage', `Invalid marks for ${SUBJECTS[i]}! Must be between 0-100.`, 'error');
            return false;
        }
    }
    
    students[index].marks = marksArray;
    saveStudents(students);
    return true;
}

// Get total marks for a student
function getTotalMarks(marks) {
    return marks.reduce((sum, mark) => mark >= 0 ? sum + mark : sum, 0);
}

// Get percentage for a student
function getPercentage(marks) {
    const total = getTotalMarks(marks);
    const count = marks.filter(m => m >= 0).length;
    if (count === 0) return 0;
    return Math.round((total / (count * 100)) * 100);
}

// Calculate dashboard statistics
function getDashboardStats() {
    const students = getStudents();
    const studentsWithMarks = students.filter(s => s.marks.some(m => m >= 0));
    
    let totalPercentage = 0;
    let highestPercentage = 0;
    let passedCount = 0;
    let failedCount = 0;
    
    studentsWithMarks.forEach(student => {
        const percentage = getPercentage(student.marks);
        totalPercentage += percentage;
        if (percentage > highestPercentage) {
            highestPercentage = percentage;
        }
        if (percentage >= 36) {
            passedCount++;
        } else {
            failedCount++;
        }
    });
    
    const avgPercentage = studentsWithMarks.length > 0 ? 
        Math.round(totalPercentage / studentsWithMarks.length) : 0;
    
    return {
        totalStudents: students.length,
        studentsWithMarks: studentsWithMarks.length,
        avgPercentage: avgPercentage,
        highestPercentage: highestPercentage,
        passedCount: passedCount,
        failedCount: failedCount
    };
}

// Get grade for marks
function getGrade(marks) {
    if (marks >= 90) return 'O - Outstanding';
    if (marks >= 80) return 'A - Excellent';
    if (marks >= 70) return 'B - Good';
    if (marks >= 60) return 'C - Average';
    if (marks >= 50) return 'D - Below Average';
    if (marks >= 36) return 'E - Poor';
    return 'F - Fail';
}

// Get grade letter only
function getGradeLetter(marks) {
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    if (marks >= 36) return 'E';
    return 'F';
}

// Calculate grade distribution
function getGradeDistribution() {
    const students = getStudents();
    const grades = {
        O: 0, // 90-100%
        A: 0, // 80-89%
        B: 0, // 70-79%
        C: 0, // 60-69%
        D: 0, // 50-59%
        E: 0, // 36-49%
        F: 0  // <36%
    };
    
    students.forEach(student => {
        if (student.marks.some(m => m >= 0)) {
            const percentage = getPercentage(student.marks);
            if (percentage >= 90) grades.O++;
            else if (percentage >= 80) grades.A++;
            else if (percentage >= 70) grades.B++;
            else if (percentage >= 60) grades.C++;
            else if (percentage >= 50) grades.D++;
            else if (percentage >= 36) grades.E++;
            else grades.F++;
        }
    });
    
    return grades;
}

// Delete a student
function deleteStudent(rollNumber) {
    let students = getStudents();
    students = students.filter(s => s.rollNumber !== rollNumber);
    
    // Re-number roll numbers
    students.forEach((s, index) => {
        s.rollNumber = index + 1;
    });
    
    saveStudents(students);
    return true;
}

// Search student by name or roll number
function searchStudent(query) {
    const students = getStudents();
    const lowerQuery = query.toString().toLowerCase();
    
    for (let student of students) {
        if (student.name.toLowerCase().includes(lowerQuery) || 
            student.rollNumber.toString() === query) {
            return { found: true, student: student };
        }
    }
    
    return { found: false };
}

// ============================================
// UI FUNCTIONS
// ============================================

// Show message
function showMessage(elementId, text, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 4000);
}

// Update dashboard
function updateDashboard() {
    const stats = getDashboardStats();
    document.getElementById('totalStudents').textContent = stats.totalStudents;
    document.getElementById('avgPercentage').textContent = stats.avgPercentage + '%';
    document.getElementById('highestAvg').textContent = stats.highestPercentage + '%';
    document.getElementById('passedCount').textContent = stats.passedCount;
    document.getElementById('failedCount').textContent = stats.failedCount;
    
    // Update grade distribution
    const grades = getGradeDistribution();
    document.getElementById('gradeO').textContent = grades.O;
    document.getElementById('gradeA').textContent = grades.A;
    document.getElementById('gradeB').textContent = grades.B;
    document.getElementById('gradeC').textContent = grades.C;
    document.getElementById('gradeD').textContent = grades.D;
    document.getElementById('gradeE').textContent = grades.E;
    document.getElementById('gradeF').textContent = grades.F;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update student select dropdown
function updateStudentSelect() {
    const students = getStudents();
    const select = document.getElementById('studentSelect');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Select a student --</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.rollNumber;
        option.textContent = `Roll #${student.rollNumber} - ${student.name}`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

// Display all students
function displayStudents() {
    const students = getStudents();
    const container = document.getElementById('studentsList');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-message">No students found. Add a student to get started!</p>';
        return;
    }
    
    let html = '';
    students.forEach(student => {
        const hasMarks = student.marks.some(m => m >= 0);
        const totalMarks = hasMarks ? getTotalMarks(student.marks) : 0;
        const percentage = hasMarks ? getPercentage(student.marks) : 0;
        const overallGrade = hasMarks ? getGrade(Math.round(percentage)) : '--';
        
        html += `
            <div class="student-card">
                <div class="student-header">
                    <h3>${escapeHtml(student.name)}</h3>
                    <span class="roll-number">Roll #${student.rollNumber}</span>
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
                            <span class="stat-value grade-badge ${overallGrade.charAt(0).toLowerCase()}">${overallGrade.charAt(0)}</span>
                        </div>
                    </div>
                    
                    <div class="subject-marks-mini">
                        ${student.marks.map((mark, i) => {
                            if (mark >= 0) {
                                return `<div class="mini-subject"><strong>${SUBJECTS[i].substring(0, 3)}</strong>: ${mark}</div>`;
                            }
                            return `<div class="mini-subject"><strong>${SUBJECTS[i].substring(0, 3)}</strong>: --</div>`;
                        }).join('')}
                    </div>
                ` : `
                    <div class="no-marks-message">
                        <p>No marks entered yet. Add marks in the "Add Marks" section.</p>
                    </div>
                `}
                
                <div class="student-actions">
                    <button class="btn btn-small btn-danger" onclick="openDeleteModal(${student.rollNumber})">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Open delete modal
function openDeleteModal(rollNumber) {
    document.getElementById('deleteIndex').value = rollNumber;
    document.getElementById('deleteModal').classList.add('show');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
}

// Switch sections
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
    
    // Update UI if needed
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'view') {
        displayStudents();
    } else if (sectionId === 'add-marks') {
        updateStudentSelect();
    }
    
    window.scrollTo(0, 0);
}

// Update marks summary
function updateMarksSummary() {
    const inputs = document.querySelectorAll('.subject-marks');
    let total = 0;
    let count = 0;
    
    inputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        if (input.value !== '' && value >= 0 && value <= 100) {
            total += value;
            count++;
        }
    });
    
    const percentage = count > 0 ? Math.round((total / (count * 100)) * 100) : 0;
    const grade = count === 7 ? getGradeLetter(Math.round(percentage)) : '--';
    
    document.getElementById('totalMarks').textContent = total;
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('overallGrade').textContent = grade;
    document.getElementById('overallGrade').className = `grade-badge ${grade.toLowerCase()}`;
    
    // Update individual grade badges
    inputs.forEach((input, index) => {
        const value = parseInt(input.value) || -1;
        const gradeSpan = input.parentElement.querySelector('.mark-grade');
        if (value >= 0) {
            gradeSpan.textContent = getGrade(value);
            gradeSpan.style.display = 'block';
        } else {
            gradeSpan.style.display = 'none';
        }
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Add Student Form
    document.getElementById('addStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('studentName').value;
        const rollNumber = addStudent(name);
        
        if (rollNumber) {
            showMessage('addStudentMessage', 'Student added successfully!', 'success');
            
            // Display new student info
            document.getElementById('newStudentInfo').innerHTML = `
                <div class="new-student-card">
                    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Roll Number:</strong> ${rollNumber}</p>
                </div>
            `;
            
            this.reset();
            updateStudentSelect();
            updateDashboard();
        }
    });
    
    // Student Select for adding marks
    document.getElementById('studentSelect').addEventListener('change', function() {
        if (this.value) {
            const rollNumber = parseInt(this.value);
            const students = getStudents();
            const student = students.find(s => s.rollNumber === rollNumber);
            
            // Check if student already has marks
            if (student && student.marks.some(m => m >= 0)) {
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
    document.getElementById('addMarksForm').addEventListener('submit', function(e) {
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
        
        if (addMarks(rollNumber, marksArray)) {
            // Get student details for confirmation message
            const students = getStudents();
            const student = students.find(s => s.rollNumber === rollNumber);
            const totalMarks = getTotalMarks(marksArray);
            const percentage = getPercentage(marksArray);
            const grade = getGrade(marksArray);
            
            const confirmationMsg = `✓ Marks saved for ${student.name}!\nTotal: ${totalMarks}/700 | Percentage: ${percentage}% | Grade: ${grade}`;
            showMessage('addMarksMessage', confirmationMsg, 'success');
            
            document.getElementById('studentSelect').value = '';
            document.getElementById('addMarksForm').style.display = 'none';
            updateStudentSelect();
            displayStudents();
            updateDashboard();
        }
    });
    
    // Delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const rollNumber = parseInt(document.getElementById('deleteIndex').value);
        if (deleteStudent(rollNumber)) {
            closeDeleteModal();
            displayStudents();
            updateStudentSelect();
            updateDashboard();
            showMessage('studentsList', 'Student deleted successfully!', 'success');
        }
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', function() {
        const query = document.getElementById('searchInput').value;
        const resultContainer = document.getElementById('searchResult');
        
        if (!query.trim()) {
            resultContainer.innerHTML = '';
            return;
        }
        
        const result = searchStudent(query);
        
        if (result.found) {
            const student = result.student;
            const hasMarks = student.marks.some(m => m >= 0);
            const totalMarks = hasMarks ? getTotalMarks(student.marks) : 0;
            const percentage = hasMarks ? getPercentage(student.marks) : 0;
            const overallGrade = hasMarks ? getGrade(Math.round(percentage)) : '--';
            
            let marksHtml = '';
            if (hasMarks) {
                marksHtml = `
                    <div class="search-marks-table">
                        <table>
                            <tr>
                                <th>Subject</th>
                                <th>Marks</th>
                                <th>Grade</th>
                            </tr>
                            ${student.marks.map((mark, i) => {
                                if (mark >= 0) {
                                    return `
                                        <tr>
                                            <td>${SUBJECTS[i]}</td>
                                            <td>${mark}/100</td>
                                            <td><span class="grade-badge ${getGradeLetter(mark).toLowerCase()}">${getGradeLetter(mark)}</span></td>
                                        </tr>
                                    `;
                                }
                                return `
                                    <tr>
                                        <td>${SUBJECTS[i]}</td>
                                        <td>--</td>
                                        <td>--</td>
                                    </tr>
                                `;
                            }).join('')}
                        </table>
                        <div class="search-summary">
                            <p><strong>Total Marks:</strong> ${totalMarks}/700</p>
                            <p><strong>Percentage:</strong> ${percentage}%</p>
                            <p><strong>Overall Grade:</strong> <span class="grade-badge ${overallGrade.charAt(0).toLowerCase()}">${overallGrade.charAt(0)}</span></p>
                        </div>
                    </div>
                `;
            } else {
                marksHtml = '<p class="no-marks-message">No marks entered yet.</p>';
            }
            
            resultContainer.className = 'search-result found';
            resultContainer.innerHTML = `
                <div class="result-item">
                    <span class="result-label">Student Found! ✓</span>
                </div>
                <div class="result-item">
                    <strong>Name:</strong> ${escapeHtml(student.name)}<br>
                    <strong>Roll Number:</strong> ${student.rollNumber}
                </div>
                ${marksHtml}
                <div class="student-actions" style="margin-top: 15px;">
                    <button class="btn btn-small btn-danger" onclick="openDeleteModal(${student.rollNumber})">Delete</button>
                </div>
            `;
        } else {
            resultContainer.className = 'search-result not-found';
            resultContainer.innerHTML = '<span class="result-label">❌ Student not found!</span>';
        }
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('searchBtn').click();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const deleteModal = document.getElementById('deleteModal');
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // ============================================
    // INTERACTIVE BUTTON ENHANCEMENTS
    // ============================================

    // Add smooth button animations
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        button.addEventListener('click', function(e) {
            // Create ripple effect on click
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
        });
    });

    // Add input focus animations
    document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.01)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Add nav button smooth transitions
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add card hover effects
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
        });
    });

    // Add form submission animation
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '✓ Student Added!';
            submitBtn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 2000);
        });
    }

    // Add success message animation
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('message') && mutation.target.classList.contains('show')) {
                mutation.target.style.animation = 'slideInMessage 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
    });

    const messageEl = document.getElementById('addStudentMessage');
    if (messageEl) {
        observer.observe(messageEl, { attributes: true, attributeFilter: ['class'] });
    }

    // Initial load
    displayStudents();
    updateDashboard();
});
