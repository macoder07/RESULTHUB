# 🎓 ResultHub — Student Result Management System

A sleek, modern, dark-themed **Student Result Management System** with **role-based access control**, built using pure **HTML, CSS & JavaScript** — no frameworks, no dependencies, no backend required.

## Features

### Role-Based Authentication
- **Admin Login** — Password-protected access to full CRUD operations
- **Student View** — Roll-number based read-only access to personal results
- Session persistence across page reloads
- Default admin password: `admin123`

### Admin Capabilities
-  Add new student records
-  Edit existing records
-  Delete student records
-  Global search across all students
-  Filter by branch, status, and grade
-  View detailed analytics and class performance

### Student Capabilities
-  Secure read-only access to **own results only**
-  View subject-wise marks with visual progress bars
-  See GPA, grade, and pass/fail status
-  Cannot tamper with marks or access other students' data

### Dashboard & Analytics
- Total students, pass/fail counts, class average GPA
- Top scorer and highest GPA highlight cards
- **Average Marks by Subject** bar chart
- **Grade Distribution** visualization (A+ to F)
- **Students by Branch** breakdown
- Recent students table with quick actions

### Data Persistence
- All data stored locally in browser via **LocalStorage**
- No backend or database setup required
- Session management via SessionStorage



## Tech Stack

| Layer   | Technology                              |
|---------|-----------------------------------------|
| Markup  | HTML5                                   |
| Styling | CSS3 (Custom Properties, Grid, Flexbox) |
| Logic   | Vanilla JavaScript (ES6+)               |
| Storage | LocalStorage + SessionStorage           |
| Fonts   | Google Fonts (Syne, DM Mono)            |



## Project Structure

ResultHub/
├── index.html      # Main HTML structure
├── style.css       # All styling and themes
└── script.js       # Authentication, CRUD, analytics logic


## 🔑 Default Credentials

### Admin Access
- **Password:** `admin123`
- Full access to all features

### Student Access
Try logging in with any of the demo roll numbers:
- `ECE2024001`
- `CSE2024002`
- `ME2024003`
- `ECE2024004`
- `CSE2024005`
- `EE2024006`



## 📸 Screenshots

LOGIN PAGE-: <img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/17c1de68-adee-4aea-a29d-9796b1112122" />
ADMIN DASHBOARD INTERFACE-: <img width="1920" height="933" alt="image" src="https://github.com/user-attachments/assets/fe29ec22-afaa-4cf7-9c2e-50f82c724260" />
ADMIN ALL STUDENTS INTERFACE-: <img width="1920" height="924" alt="image" src="https://github.com/user-attachments/assets/4b249e02-fb64-4ca9-815f-a5dba177ed7c" />
ADMIN ADD STUDENT INTERFACE-: <img width="1920" height="936" alt="image" src="https://github.com/user-attachments/assets/400b3500-5cbf-4404-b352-9909d9fa6b31" />
STUDENT INTERFACE-: <img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/6938bb1c-0c1c-42ea-b717-91a41a0fbbbd" />


## Grading System

| Marks Range | Grade | GPA |
|-------------|-------|-----|
|  90 – 100   |   A+  |  10 |
|  80 – 089   |   A   |  09 |
|  70 – 079   |   B+  |  08 |
|  60 – 069   |   B   |  07 |
|  50 – 059   |   C   |  06 |
|  40 – 049   |   D   |  05 |
|  Below 40   |   F   |  00 |

> A student is marked as **Pass** only if they score ≥ 40 in **every** subject.

---

## Security Features

- Password-protected admin operations
- Role-based UI rendering (buttons hidden for non-admins)
- Function-level permission checks (even console access blocked)
- Students restricted to viewing **only their own records**
- Search and admin features fully disabled in student mode

---

## Subjects Tracked

1. Mathematics
2. Physics / Science
3. Programming
4. Electronics / Core
5. English / Communication
6. Elective


## Author

Made with ❤️ by PARI BINDAL

- LinkedIn: www.linkedin.com/in/pari-bindal-990b60245


## Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub!

