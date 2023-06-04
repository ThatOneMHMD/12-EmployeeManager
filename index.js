const inquirer = require('inquirer');
const importedFunctions = require('./server.js');




const questions = [  
    {
        type: 'list',
        name: 'query',
        message: 'What would you like to do?',
        choices: ["View all departments", "Veiw all roles", "Veiw all employees", "View utilized budget by department", "Add a new department", "Add a new role", "Add a new employee","Update the role of an employee", "Delete a department", "Delete a role", "Delete an employee","Exit Query"],
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
        name: 'newRoleDepartment',
        message: 'Which department does the new role belong to?',
        choices: async () => {
            try {
                const departmentsNames = await importedFunctions.getDepartmentsNames();
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
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Add a new employee",
    },
    {
        type: 'list',
        name: 'nameOfUpdatedEmployee',
        message: 'Who is the employee whose role you wish to update?',
        choices: async () => {
            try {
                const employeeNames = await importedFunctions.getEmployeeNames();
                return employeeNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Update the role of an employee",
    },
    {
        type: 'list',
        name: 'newRoleName',
        message: 'What new role do you wish to assign to the employee?',
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Update the role of an employee",
    },
    {
        type: 'list',
        name: 'deleteDepartment',
        message: 'Which department do you wish to delete?',
        choices: async () => {
            try {
                const departmentsNames = await importedFunctions.getDepartmentsNames();
                return departmentsNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Delete a department",
    },
    {
        type: 'list',
        name: 'deleteRole',
        message: 'Which role do you wish to delete?',
        choices: async () => {
            try {
                const roleNames = await importedFunctions.getRolesNames();
                return roleNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
            }
        },
        when: (answers) => answers.query === "Delete a role",
    },
    {
        type: 'list',
        name: 'deleteEmployee',
        message: 'Which employee do you wish to delete?',
        choices: async () => {
            try {
                const employeeNames = await importedFunctions.getEmployeeNames();
                return employeeNames;
            } catch (err) {
                console.error(err);
                return []; // Empty array in case of an error
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

                default: //this line triggers for any option that is not mentioned above, which is my "Exit Query" option!
                    console.log("Goodbye!");
                    process.exit();
                };

            // Delay of 100 milliseconds before re-prompting the questions. OTHERWISE, the choice list will cut into the prevous query! (So, like cut the tables off etc.)
            setTimeout(init, 150); 
            
        });
};
    
// Function call to initialize app
init();

// CHECKPOINT!!!   