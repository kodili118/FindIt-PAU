# FindIt PAU — Responsive Lost & Found Website

This is a vanilla HTML, CSS and JavaScript classroom prototype for the FindIt PAU venture.

## 1. Requirements
- Visual Studio Code
- A modern browser (Chrome, Edge, Firefox, Safari)
- VS Code extension: Live Server (recommended)

No Node.js or framework is required for this front-end version.

## 2. Start the project in VS Code
1. Download `FindIt_PAU_Website.zip`.
2. Extract the ZIP to a folder you can find easily, such as Documents.
3. Open Visual Studio Code.
4. Select **File → Open Folder**.
5. Choose the extracted `FindIt_PAU_Website` folder.
6. In the Explorer panel, confirm you can see:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
7. Install Live Server:
   - Click the Extensions icon on the left (four squares).
   - Search for **Live Server**.
   - Install the extension published by Ritwick Dey.
8. Open `index.html`.
9. Right-click inside the editor and choose **Open with Live Server**.
10. Your browser should open a local address similar to `http://127.0.0.1:5500/`.

You can also open `index.html` directly in a browser, but Live Server is more convenient while editing.

## 3. Understand the files
- `index.html` contains the page structure, navigation, forms and modal windows.
- `styles.css` controls colours, spacing, cards, layout and mobile responsiveness.
- `app.js` controls registration/login demo, reports, search, claims, notifications, and the admin dashboard.

Keep all three files in the same folder. Do not rename one unless you also update the links in `index.html`.

## 4. Test the main user journeys
### A. Create a student account
1. Click **Create account**.
2. Enter a name, email and password (minimum 6 characters).
3. Choose **Student / Staff**.
4. Submit the form.

### B. Report a lost or found item
1. Log in.
2. Click **I lost something** or **I found something**.
3. Complete the form.
4. Optionally attach a small image (1.5 MB maximum).
5. Submit. The item should appear on the community board and in My Reports.

### C. Browse and search
1. Click **Browse items**.
2. Search by name, location or description.
3. Use the report-type and category filters.
4. Open a listing using **View details**.

### D. Submit a claim
1. Create a second student account in a different browser profile, or log out and create another account.
2. Open a found-item report.
3. Submit a description of private identifying details as an ownership claim.
4. Log in as the demo administrator to review the claim.

### E. Explore the administrator dashboard
1. Log out.
2. Click **Create account**.
3. Choose **Demo administrator** as the prototype account type.
4. Submit the form.
5. Open **Admin**.
6. Review reports, mark an item as returned, remove a report, and approve or reject claims.

**Important:** The demo lets a person choose the administrator role during registration. This is only to make the classroom prototype easy to demonstrate. A real service must never let users assign themselves admin privileges.

## 5. What is functional in this prototype?
- Student/staff and demo administrator account flows
- Login and logout demonstration
- Lost and found report submission
- Image upload preview stored as a browser data URL
- Search by keyword
- Filters by report type and category
- Item detail view
- Ownership claim submission
- Admin claim approval/rejection
- Admin report removal and returned status
- In-app notification records
- Basic potential-match notification based on category or title keywords
- Browser localStorage persistence
- Responsive desktop and mobile layout

## 6. Important limitations — prototype versus real service
This is a front-end demonstration. Data is stored only in the current browser's localStorage. It does not synchronise between different students, phones or computers.

Passwords are stored in browser storage in this demo and are NOT securely protected. Do not use real passwords or sensitive personal information. The demo admin role is also not secure.

Before a real PAU launch, the project needs:
- Backend and shared database (e.g. Firebase or Supabase)
- Secure authentication and password handling
- PAU email verification and server-controlled administrator roles
- Secure image storage with access controls
- Server-side authorisation and input validation
- Real notification delivery
- Stronger claim review, audit trail and abuse reporting
- University approval and an agreed campus handover procedure
- Privacy notice, data retention and deletion process

## 7. Suggested build order for your coursework
1. Run the website and understand the three files.
2. Test registration, login and reporting.
3. Test search and filters.
4. Test claims and admin actions.
5. Customise the text, categories and branding based on feedback from PAU students.
6. Conduct a short student survey to validate the problem.
7. If required by the lecturer, add a backend in a later phase.

## 8. Troubleshooting
- **Page is blank:** check that `styles.css` and `app.js` are in the same folder as `index.html`; open browser Developer Tools → Console.
- **Buttons do nothing:** check that the script tag at the bottom of `index.html` says `app.js`.
- **Changes do not appear:** save the file and refresh the browser.
- **Old test data remains:** open browser Developer Tools → Application/Storage → Local Storage and clear the entries beginning with `findit_`. This removes demo accounts and reports from that browser.
- **Live Server is missing:** install the Live Server extension and restart VS Code if needed.
