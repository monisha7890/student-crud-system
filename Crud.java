import java.util.Scanner;

class Student {
	String name;
	int rollNumber;
	int[] marks = new int[7]; // Telugu, English, Hindi, Sanskrit, Math, Science, Social Studies
	static final String[] SUBJECTS = {"Telugu", "English", "Hindi", "Sanskrit", "Mathematics", "Science", "Social Studies"};
	
	public Student(String name) {
		this.name = name;
		for (int i = 0; i < 7; i++) {
			marks[i] = -1; // -1 means not entered
		}
	}
	
	public int getTotal() {
		int total = 0;
		for (int mark : marks) {
			if (mark >= 0) total += mark;
		}
		return total;
	}
	
	public double getPercentage() {
		int count = 0;
		for (int mark : marks) {
			if (mark >= 0) count++;
		}
		if (count == 0) return 0;
		return (getTotal() * 100.0) / (count * 100);
	}
	
	public String getGrade(int marks) {
		if (marks >= 90) return "O - Outstanding";
		if (marks >= 80) return "A - Excellent";
		if (marks >= 70) return "B - Good";
		if (marks >= 60) return "C - Average";
		if (marks >= 50) return "D - Below Average";
		if (marks >= 36) return "E - Poor";
		return "F - Fail";
	}
}

public class Crud {
	static Student[] students = new Student[100];
	static int count = 0;
	
	public static void main(String[] args) {
		Scanner obj = new Scanner(System.in);
		int choice = 0;
		do {
			System.out.println("\n----------Student Management System --------");
			System.out.println("1. Add Student");
			System.out.println("2. Add Marks");
			System.out.println("3. View All Students");
			System.out.println("4. View Student Details");
			System.out.println("5. Search Student");
			System.out.println("6. Delete Student");
			System.out.println("7. Exit");
			
			System.out.print("Enter Choice: ");
			choice = obj.nextInt();
			obj.nextLine();
			
			switch(choice) {
			case 1:
				addStudent(obj);
				break;
			case 2:
				addMarks(obj);
				break;
			case 3:
				viewAllStudents();
				break;
			case 4:
				viewStudentDetails(obj);
				break;
			case 5:
				searchStudent(obj);
				break;
			case 6:
				deleteStudent(obj);
				break;
			case 7:
				System.out.println("Thank you for using Student Management System!");
				break;
			default:
				System.out.println("Invalid Choice");
			}	
		} while(choice != 7);
		obj.close();
	}
	
	// Add Student - only name, auto-generate roll number
	static void addStudent(Scanner obj) {
		if (count >= 100) {
			System.out.println("Storage Full! Cannot add more students.");
			return;
		}
		System.out.print("Enter Student Name: ");
		String name = obj.nextLine();
		
		if (name.trim().isEmpty()) {
			System.out.println("Student name cannot be empty!");
			return;
		}
		
		students[count] = new Student(name);
		students[count].rollNumber = count + 1;
		
		System.out.println("✓ Student added successfully!");
		System.out.println("Roll Number: " + students[count].rollNumber);
		count++;
	}
	
	// Add Marks for a student
	static void addMarks(Scanner obj) {
		if (count == 0) {
			System.out.println("No students found. Add students first!");
			return;
		}
		
		viewAllStudents();
		System.out.print("Enter Roll Number to add marks: ");
		int rollNo = obj.nextInt();
		obj.nextLine();
		
		if (rollNo < 1 || rollNo > count) {
			System.out.println("Invalid Roll Number!");
			return;
		}
		
		Student student = students[rollNo - 1];
		
		// Check if student already has marks
		boolean hasMarks = false;
		for (int mark : student.marks) {
			if (mark >= 0) {
				hasMarks = true;
				break;
			}
		}
		
		if (hasMarks) {
			System.out.println("⚠ Marks already exist for " + student.name + " and cannot be changed!");
			return;
		}
		
		System.out.println("\n--- Adding Marks for " + student.name + " ---");
		
		for (int i = 0; i < 7; i++) {
			System.out.print("Enter marks for " + Student.SUBJECTS[i] + " (0-100): ");
			int marks = obj.nextInt();
			
			if (marks < 0 || marks > 100) {
				System.out.println("Invalid! Marks must be between 0 and 100");
				i--;
				continue;
			}
			
			student.marks[i] = marks;
			System.out.println("Grade: " + student.getGrade(marks));
		}
		
		System.out.println("\n✓ Marks added successfully!");
	}
	
	// View all students with basic info
	static void viewAllStudents() {
		if (count == 0) {
			System.out.println("No students found!");
			return;
		}
		
		System.out.println("\n====== Student List ======");
		System.out.println(String.format("%-5s %-20s", "Roll", "Name"));
		System.out.println("---------------------------");
		
		for (int i = 0; i < count; i++) {
			System.out.println(String.format("%-5d %-20s", students[i].rollNumber, students[i].name));
		}
	}
	
	// View detailed student information with all marks
	static void viewStudentDetails(Scanner obj) {
		if (count == 0) {
			System.out.println("No students found!");
			return;
		}
		
		System.out.print("Enter Roll Number to view details: ");
		int rollNo = obj.nextInt();
		
		if (rollNo < 1 || rollNo > count) {
			System.out.println("Invalid Roll Number!");
			return;
		}
		
		Student student = students[rollNo - 1];
		System.out.println("\n========== Student Details ==========");
		System.out.println("Name: " + student.name);
		System.out.println("Roll Number: " + student.rollNumber);
		System.out.println("\nMarks:");
		System.out.println(String.format("%-20s %-10s %-20s", "Subject", "Marks", "Grade"));
		System.out.println("----------------------------------------------");
		
		for (int i = 0; i < 7; i++) {
			if (student.marks[i] >= 0) {
				System.out.println(String.format("%-20s %-10d %-20s", 
					Student.SUBJECTS[i], student.marks[i], student.getGrade(student.marks[i])));
			}
		}
		
		System.out.println("----------------------------------------------");
		System.out.println("Total Marks: " + student.getTotal() + " / 700");
		System.out.println(String.format("Percentage: %.2f%%", student.getPercentage()));
	}
	
	// Search student by name
	static void searchStudent(Scanner obj) {
		if (count == 0) {
			System.out.println("No students found!");
			return;
		}
		
		System.out.print("Enter student name to search: ");
		String name = obj.nextLine();
		
		boolean found = false;
		for (int i = 0; i < count; i++) {
			if (students[i].name.equalsIgnoreCase(name)) {
				System.out.println("\nStudent found!");
				System.out.println("Roll Number: " + students[i].rollNumber);
				System.out.println("Name: " + students[i].name);
				found = true;
				break;
			}
		}
		
		if (!found) {
			System.out.println("Student not found!");
		}
	}
	
	// Delete a student
	static void deleteStudent(Scanner obj) {
		if (count == 0) {
			System.out.println("No students found!");
			return;
		}
		
		viewAllStudents();
		System.out.print("Enter Roll Number to delete: ");
		int rollNo = obj.nextInt();
		
		if (rollNo < 1 || rollNo > count) {
			System.out.println("Invalid Roll Number!");
			return;
		}
		
		for (int i = rollNo - 1; i < count - 1; i++) {
			students[i] = students[i + 1];
			students[i].rollNumber--;
		}
		
		count--;
		System.out.println("✓ Student deleted successfully!");
	}
}