# EmployeeManager

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## Description

This is the code files for the corresponsing command-line application that functions as a professional content management systems (CMS) which is called Employee Manager. Once run according to the instructions in index.js, the user/business owner will be able to view and manage the departments, roles, and employees in their company so that they can organize and plan their business appropriately.

## Table of Contents

- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Demo Video](#demo-video)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Credits](#credits)

## Demo Video

This video is approximately 6 mins long. Through it, all of the choices in inquirer are chosen at least once, showing what each option entails. Please note that his video has no audio.

Link: https://youtu.be/VibSohYkmTc

## Features

- When the user starts the application, they are presented with the following options: "View all departments", "Veiw all roles", "Veiw all employees", "View employees by department", "View employees by manager", "View utilized budget by department", "Add a new department", "Add a new role", "Add a new employee","Update the role of an employee", "Delete a department", "Delete a role", "Delete an employee","Exit Query"
- When they choose to view all departments, they are presented with a formatted table showing department names and department ids along with the manager name for each department
- When they choose to view all roles, they are presented with the job title, role id, the department that role belongs to, and the salary for that role
- When they choose to view all employees, they are presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
- When they choose to view employees by department, they are presented with a list of departments to choose from, once one is chosen, the corresponding employees are presented in a table showing id, first and last names, role, salary, and corresponding managers
- When they choose to view employees by manager, they are presented with a list of managers to choose from, once one is chosen, the corresponding employees are presented in a table showing id, first and last names, role, salary, and corresponding departments
- When they choose to view utilized budget by department, they are presented with a table showing each department and its corresponding budget. Addiiotnally, at the bottom row, the budget total of all the departments is presented
- When they choose to add a new department, they are asked to input the name of the department they wish to add, and then that new department is added
- When they choose to add a new role, they are asked to input the title of the role, the salary, and what department it belongs to, then that role is added
- When they choose to add a new employee, they are asked to input a first name, last name, and a corresponding role, then the employee they entered is added
- When they choose to update the role of an employee, they are presented with a list of employees to choose in order to update, and then the new role they wish to give them
- When they choose to delete a department, they are presented with a list of all available departments to choose from, the chosen one will be deleted, together with all associated roles and employees
- When they choose to delete a role, they are presented with a list of all available roles to choose from, the chosen one will be deleted, together with all associated employees
- When they choose to delete an employee, they are presented with a list of all available employees to choose from, the chosen one will be deleted
- When they choose to exit the query, they commnad-line application is then closed

## Installation

To use your own professional Employee Manager, "git clone" the repo down to your local so you have the Node project on your local. Then follow the usage instruction below in the Usage section.

## Usage

To start the application, follow these steps carefully:

1. Rename the ".env.EXAMPLE" file to the left as ".env", then enter your own mysql information
2. Open Integrated Terminal and make sure you are in the right directory
3. In the "db" directory, type in, in the terminal, the following: 'mysql -u "YOUR-OWN-mysql-username" -p'. Press ENTER and then enter your password
4. After you have accessed your mysql terminal, type in this: 'SOURCE schema.sql;' and then 'SOURCE seeds.sql;', this will run the mysql code and seed the tables with data
5. Now, go back in the root folder directory and type inthe following: 'npm install'
6. Lastly, type in the foolowing: 'node ./index' to start answering the questions and manage your employees!

## License

MIT

## Credits

ThatOneMHMD - The creator of this website!
(Link: https://github.com/ThatOneMHMD)
