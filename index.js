// To start the application, follow these steps carefully:
// 1. Rename the ".env.EXAMPLE" file to the left as ".env", then enter your own mysql information
// 2. Open Integrated Terminal and make sure you are in the right directory
// 3. Type in, in the terminal, the following: 'npm install'
// 4. Follow that with: 'mysql -u "YOUR-OWN-mysql-username" -p'. Press ENTER and then enter your password
// 5. After you have accessed your mysql terminal, type in this: 'SOURCE schema.sql;' and then 'SOURCE seeds.sql;', this will run the mysql code and seed the tables with data
// 6. Lastly, type in the foolowing: 'node ./index' to start answering the questions and manage your employees!

// Code Comments:

// Import Data: inquirer library for terminal questions, and imported data/functions from server.js
const inquirer = require('inquirer');
const importedFunctions = require('./server.js');

// My quesitons in an array.. First, a list of choices is presented, and depending on which option is chosen, follow-up questions are presented. (this is done with the "when" method/keyword)
const questions = [  
    {
        type: 'list',
        name: 'query',
        message: 'What would you like to do?',
        choices: ["View all departments", "Veiw all roles", "Veiw all employees", "View employees by department", "View employees by manager", "View utilized budget by department", "Add a new department", "Add a new role", "Add a new employee","Update the role of an employee", "Delete a department", "Delete a role", "Delete an employee","Exit Query"],
    },
    {
        type: 'input',
        name: 'newDepartmentName',
        message: 'What is the name of the new department you wish to add?',
        when: (answers) => answers.query === "Add a new department",
    },
    {
        type: 'input',
        name: 'newRoleTitle', 
        message: 'What is the title of the new role you wish to add?',
        when: (answers) => answers.query === "Add a new role",
    },
    {
        type: 'input',
        name: 'newRoleSalary',
        message: 'What is the salary of the new role?',
        when: (answers) => answers.query === "Add a new role",
        // makes sure that salary is a number
        validate: (input) => {
            const salary = Number(input);
            if (isNaN(salary) || salary <= 0) {
                return 'Please enter a valid salary amount.';
            }
            return true;
        }
    },
    {
        type: 'list',
        name: 'viewEmployeesByDepartment',
        message: 'What is the department which its employees you wish to view?',
        // gives a list of options that contain the department names. IF none are present; informs user.
        choices: async () => {
            try {
              const departmentsNames = await importedFunctions.getDepartmentsNames();
              const noDepartmentsAvailable = ["No departments available"];
              if (departmentsNames.length === 0) {
                return noDepartmentsAvailable;
              };
              return departmentsNames;
            } catch (err) {
              console.error(err);
              return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "View employees by department",
    },
    {
        type: 'list',
        name: 'viewEmployeesByManager',
        message: 'Whom is the manager whose employees you wish to view?',
        // gives a list of options that contain the manger names. IF none are present; informs user.
        choices: async () => {
            try {
              const managerNames = await importedFunctions.getManagerNames();
              const noManagersAvailable = ["No managers available"];
              if (managerNames.length === 0) {
                  return noManagersAvailable;
              };
              return managerNames;
            } catch (err) {
              console.error(err);
              return []; 
            }
        },
        when: (answers) => answers.query === "View employees by manager",
    },
    {
        type: 'list',
        name: 'newRoleDepartment',
        message: 'Which department does the new role belong to?',
        // gives a list of options that contain the department names. IF none are present; informs user. THE SAME FOR THE REST, i'll stop mentioning this...
        choices: async () => {
            try {
                const departmentsNames = await importedFunctions.getDepartmentsNames();
                const noDepartmentsAvailable = ["No departments available"];
                if (departmentsNames.length === 0) {
                    return noDepartmentsAvailable;
                };
                return departmentsNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Add a new role",
    },
    {
        type: 'input',
        name: 'newEmployeeFirstName',
        message: 'What is the first name of the employee you wish to add?',
        when: (answers) => answers.query === 'Add a new employee',
        // names cannot have spaces, this makes sure only first name is inputed and user does not mistakingly inputs first and last name together!
        validate: (input) => {
          if (input.includes(' ')) {
            return 'First name should not contain spaces. Please enter a valid first name.';
          }
          return true;
        },
    },  
    {
        type: 'input',
        name: 'newEmployeeLastName',
        message: 'What is the last name of the employee you wish to add?',
        when: (answers) => answers.query === "Add a new employee",
        // names cannot have spaces, this makes sure only first name is inputed and user does not mistakingly inputs first and last name together!
        validate: (input) => {
            if (input.includes(' ')) {
              return 'Last name should not contain spaces. Please enter a valid first name.';
            }
            return true;
        },
  
    },
    {
        type: 'list',
        name: 'newEmployeeRole',
        message: 'What role does the new employee hold?',
        // list of role names!
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                const noRolesAvailable = ["No roles available"];
                if (roleNames.length === 0) {
                    return noRolesAvailable;
                };
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; 
            }
        },
        when: (answers) => answers.query === "Add a new employee",
    },
    {
        type: 'list',
        name: 'nameOfUpdatedEmployee',
        message: 'Who is the employee whose role you wish to update?',
        // list of employees
        choices: async () => {
            try {
                const employeeNames = await importedFunctions.getEmployeeNames();
                const noEmployeesAvailable = ["No employees available"];
                if (employeeNames.length === 0) {
                    return noEmployeesAvailable;
                };
                return employeeNames;
            } catch (err) {
                console.error(err);
                return [];
            }
        },
        when: (answers) => answers.query === "Update the role of an employee",
    },
    {
        type: 'list',
        name: 'newRoleName',
        message: 'What new role do you wish to assign to the employee?',
        // list of roles
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                const noRolesAvailable = ["No roles available"];
                if (roleNames.length === 0) {
                    return noRolesAvailable;
                };
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; 
            }
        },
        when: (answers) => answers.query === "Update the role of an employee" && answers.nameOfUpdatedEmployee !== "No employees available",
    },
    {
        type: 'list',
        name: 'deleteDepartment',
        message: 'Which department do you wish to delete?',
        // list of departments
        choices: async () => {
            try {
                const departmentsNames = await importedFunctions.getDepartmentsNames();
                const noDepartmentsAvailable = ["No departments available"];
                if (departmentsNames.length === 0) {
                    return noDepartmentsAvailable;
                };
                return departmentsNames;
            } catch (err) {
                console.error(err);
                return []; 
            }
        },
        when: (answers) => answers.query === "Delete a department",
    },
    {
        type: 'list',
        name: 'deleteRole',
        message: 'Which role do you wish to delete?',
        // list of roles
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                const noRolesAvailable = ["No roles available"];
                if (roleNames.length === 0) {
                    return noRolesAvailable;
                };
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; 
            }
        },
        when: (answers) => answers.query === "Delete a role",
    },
    {
        type: 'list',
        name: 'deleteEmployee',
        message: 'Which employee do you wish to delete?',
        // list of employees
        choices: async () => {
            try {
                const employeeNames = await importedFunctions.getEmployeeNames();
                const noEmployeesAvailable = ["No employees available"];
                if (employeeNames.length === 0) {
                    return noEmployeesAvailable;
                };
                return employeeNames;
            } catch (err) {
                console.error(err);
                return [];
            }
        },
        when: (answers) => answers.query === "Delete an employee",
    },
];
    
// This function initializes app (runs inquirer) and runs the associated functions!
function init() {
    inquirer
        .prompt(questions)
        .then((answers) => {

            // ALL available cases: proceed with whichever reponse the user gave!
            switch (answers.query) {
                case "View all departments":
                    importedFunctions.viewAllDepartments(answers);
                    break;

                case "Veiw all roles":
                    importedFunctions.viewAllRoles(answers);
                    break;

                case "Veiw all employees":
                    importedFunctions.viewAllEmployees(answers);
                    break;

                case "View employees by department":
                    importedFunctions.viewEmployeesByDepartment(answers);
                    break;

                case "View employees by manager":
                    importedFunctions.viewEmployeesByManager(answers);
                    break;

                case "View utilized budget by department":
                    importedFunctions.departmentUtilizedBudget(answers);
                    break;

                case "Add a new department":
                    importedFunctions.addNewDepartments(answers);
                    break;

                case "Add a new role":
                    importedFunctions.addNewRoles(answers);
                    break;

                case "Add a new employee":
                    importedFunctions.addNewEmployees(answers);
                    break;

                case "Update the role of an employee":
                    importedFunctions.updateEmployeeRole(answers);
                    break;

                case "Delete a department":
                    importedFunctions.deleteDepartment(answers);
                    break;

                case "Delete a role":
                    importedFunctions.deleteRole(answers);
                    break;

                case "Delete an employee":
                    importedFunctions.deleteEmployee(answers);
                    break;

                //this line triggers for any option that is not mentioned above, which is my "Exit Query" option in the list above! (could be easily changed to another case, but not needed...)
                default: 
                    console.log("Goodbye!");
                    // exit inquirer questions!
                    process.exit();
                };

            // Call/Start the funtion to ask the questions again. Note: delay of 150 milliseconds before re-prompting the questions. OTHERWISE, the choice list will cut into the prevous query! (So, like cut the tables off etc.)
            setTimeout(init, 150); 
            
        });
};
    
// Function call to initialize app/inquirer for the first time!
init();

// CHECKPOINT!!! All good! 