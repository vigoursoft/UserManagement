# UserManagement
Modules to manage users, starting with a signup module.

**Enrollment.zip** contains the node.js source files for an initial linguist signup module using email verification.
A termporary ID/PIN is created for each user and deleted at the end of the signup process.

  "dependencies": {
    "body-parser": "^1.18.2",
    "express": "^4.16.2",
    "nodemailer": "^4.4.2",
    "sqlite3": "^3.1.13"
  }
  
 Make sure to edit the email component to reflect your mail server and the server that runs
 the signup module.
 Install the dependencies and sqlite. Create the database with the tables LINGUISTS and ID.
 The ID table replaces the use of cookies. 
 
 Application flow:
 1. User goes to index.hml
 2. User enters email address and is told to "check your email".
 3. Email contains a link for the actual signup plus a random number PIN
 4. User clicks the link, enrollment server verifies the embedded ID, then redirects to signup html.
 5. User enters requested data, adds PIN from notification email. and submits the form.
 
 
