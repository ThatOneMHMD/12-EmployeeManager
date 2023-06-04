// To start the application, follow these steps carefully:
// 1. Rename the ".env.EXAMPLE" file to the left as ".env", then enter your own mysql information
// 2. Open Integrated Terminal and make sure you are in the right directory
// 3. Type in, in the console, the following: 'npm install'
// 4. Follow that with: 'mysql -u "YOUR-OWN-mysql-username" -p'. Press ENTER and then enter your password
// 5. After you have accessed your mysql terminal, type in this: 'SOURCE schema.sql;' and then 'SOURCE seeds.sql;', this will run the mysql code and seed the tables with data
// 6. Lastly, type in the foolowing: 'node ./index' to start answering the questions and manage your employees!

// Code Comments:

// Import Data: mysql2 to use mysql code in js, and dotenv to pass sensitive information safely!
const mysql = require('mysql2');
require('dotenv').config();

//CONNECT TO THE LOCAL DATABASE
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Successfully connected to the database!\n`)
)

// function for mysql code allowing user to view all departments! (and it shows the corresponding managers!)
const viewAllDepartments = () => {
  const sql = `
    SELECT 
      department.id AS department_id,
      department.department_name AS department_name,
      CONCAT(manager.first_name, ' ', manager.last_name) AS department_manager
    FROM department
    LEFT JOIN manager ON department.id = manager.department_id;
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.table(rows);
    console.log('\n');
  });
};

// function for mysql code allowing user to view all roles!
const viewAllRoles = () => {

    const sql = `
        SELECT role.id, role.title, role.salary, department.department_name AS department
        FROM role
        INNER JOIN department ON role.department_id = department.id;
    `;

    db.query(sql, (err, rows) => {
        if (err) {
        throw err;
        }
        console.table(rows);
        console.log('\n');
    });
};

// function for mysql code allowing user to view all employees!
const viewAllEmployees = () => {
  const sql = `
    SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title AS role,
      role.salary,
      department.department_name AS department,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM
      employee
    INNER JOIN
      role ON employee.role_id = role.id
    INNER JOIN
      department ON role.department_id = department.id
    LEFT JOIN
      manager ON (
        employee.manager_id = manager.id
        OR (
          role.title NOT LIKE '%manager%'
          AND department.id = manager.department_id
        )
      )
    LEFT JOIN
      employee AS emp ON emp.id = manager.id;
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.table(rows);
    console.log('\n');
  });
};

  
  

// function for mysql code allowing user to add new departments!
const addNewDepartments = (answers) => {
    const newDepartmentName = answers.newDepartmentName;
    const sqlCheck = `SELECT COUNT(*) AS count FROM department WHERE department_name = ?`;
    const sqlInsert = `INSERT INTO department (department_name) VALUES (?)`;
  
    db.query(sqlCheck, newDepartmentName, (err, result) => {
      if (err) {
        throw err;
      }
  
      const count = result[0].count;
      if (count > 0) {
        console.log(`A department with the name "${newDepartmentName}" already exists.\n`);
      } else {
        db.query(sqlInsert, newDepartmentName, (err) => {
          if (err) {
            throw err;
          }
          console.log(`The department "${newDepartmentName}" has been added.\n`);
        });
      }
    });
};
  
// function for mysql code allowing user to add new roles!
const addNewRoles = (answers) => {
    const newRoleTitle = answers.newRoleTitle;
    const newRoleSalary = answers.newRoleSalary;
    const newRoleDepartment = answers.newRoleDepartment;
  
    const roleCheckQuery = `
      SELECT COUNT(*) AS count
      FROM role r
      JOIN department d ON r.department_id = d.id
      WHERE r.title = ? AND d.department_name = ?
    `;
  
    const insertQuery = `
      INSERT INTO role (title, salary, department_id)
      SELECT ?, ?, d.id
      FROM department d
      WHERE d.department_name = ?
    `;
  
    db.query(roleCheckQuery, [newRoleTitle, newRoleDepartment], (err, result) => {
      if (err) {
        throw err;
      }
  
      const count = result[0].count;
      if (count > 0) {
        console.log(`A role with the title "${newRoleTitle}" already exists in the ${newRoleDepartment} department.\n`);
      } else {
        db.query(insertQuery, [newRoleTitle, newRoleSalary, newRoleDepartment], (err) => {
          if (err) {
            throw err;
          }
          console.log(`New role: ${newRoleTitle}, successfully added!\n`);
        });
      }
    });
};
  


// function for mysql code allowing user to add new employees!
const addNewEmployees = (answers) => {
  const newEmployeeFirstName = answers.newEmployeeFirstName;
  const newEmployeeLastName = answers.newEmployeeLastName;
  const newEmployeeRole = answers.newEmployeeRole;

  const role_ID = `SELECT id FROM role WHERE title = '${newEmployeeRole}'`;
  const department_ID = `SELECT department_id FROM role WHERE title = '${newEmployeeRole}'`;
  const managerDepartmentID = `SELECT department_id FROM manager WHERE department_id = (${department_ID})`;

  // Check if the role contains the word 'manager'
  if (newEmployeeRole.toLowerCase().includes('manager')) {
    // Check if there is already a manager for the department
    db.query(managerDepartmentID, (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        console.log('Managerial role is already occupied for this department!');
      } else {
        const managerID = 'NULL';
        const managerInsertSQL = `INSERT INTO manager (first_name, last_name, department_id) VALUES ('${newEmployeeFirstName}', '${newEmployeeLastName}', (${department_ID}))`;
        
        db.query(managerInsertSQL, (err) => {
          if (err) {
            throw err;
          }
          
          console.log(`New manager: ${newEmployeeFirstName} ${newEmployeeLastName}, has been successfully added!\n`);
          
          // Insert into the employee table
          const employeeInsertSQL = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
          VALUES ('${newEmployeeFirstName}', '${newEmployeeLastName}', (${role_ID}), ${managerID})`;
          
          db.query(employeeInsertSQL, (err) => {
            if (err) {
              throw err;
            }
            
          });
        });
      }
    });
  } else {
    const managerID = 'NULL';
    
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ('${newEmployeeFirstName}', '${newEmployeeLastName}', (${role_ID}), ${managerID})`;
    
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      
      console.log(`New employee: ${newEmployeeFirstName} ${newEmployeeLastName}, has been successfully added!\n`);
    });
  }
};
  
// function for mysql code allowing user to update an employee's role!
const updateEmployeeRole = (answers) => {
  const nameOfUpdatedEmployee = answers.nameOfUpdatedEmployee;
  const newRoleName = answers.newRoleName;
  const isManager = newRoleName.toLowerCase().includes('manager');

  const names = nameOfUpdatedEmployee.split(' ');
  const firstName = names[0];
  const lastName = names[1];

  const roleIdQuery = `SELECT id FROM role WHERE title = '${newRoleName}'`;
  const sql = `
    UPDATE employee
    SET role_id = (${roleIdQuery})
    WHERE id IN (
      SELECT emp.id
      FROM (SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}' LIMIT 1) AS emp
    );
  `;

  const addManager = `
    INSERT INTO manager (first_name, last_name, department_id)
    SELECT '${firstName}', '${lastName}', role.department_id
    FROM role
    LEFT JOIN manager ON manager.department_id = role.department_id
    WHERE title = '${newRoleName}' AND manager.id IS NULL
    LIMIT 1;
  `;

  const deleteManager = `
    DELETE FROM manager
    WHERE first_name = '${firstName}' AND last_name = '${lastName}';
  `;

  if (isManager) {
    const managerExistsQuery = `
      SELECT *
      FROM manager
      WHERE department_id = (
        SELECT department_id
        FROM role
        WHERE id = (${roleIdQuery})
      );
    `;

    db.query(managerExistsQuery, (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        console.log(`A manager already exists for the department. Only one manager per department is allowed.\n`);
      } else {
        db.query(sql, (err, result) => {
          if (err) {
            throw err;
          }
          
          // Delete works of the employee was already a manager of a certain department! This prevents the existence of two or more departments under the same manager!
          db.query(deleteManager, (err, results) => {
            if (err) {
              throw err;
            }
          });

          db.query(addManager, (err, results) => {
            if (err) {
              throw err;
            }

            console.log(`Employee "${nameOfUpdatedEmployee}" has been updated with a new managerial role, congrats!\n`);
          });


        });
      }
    });
  } else {
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }

      db.query(deleteManager, (err, results) => {
        if (err) {
          throw err;
        }
      });

      console.log(`Employee "${nameOfUpdatedEmployee}" has been updated with a new role.\n`);
    });
  }
};





  

// function for mysql code allowing user to get the employees names!
const getEmployeeNames = () => {
    return new Promise((resolve, reject) => {
        // Query to retrieve first names and last names from the employee table
        const sql = 'SELECT first_name, last_name FROM employee;';

        // Execute the query
        db.query(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            // Extract first names and last names from the result rows
            const names = rows.map((row) => `${row.first_name} ${row.last_name}`);
            resolve(names);
        });
    });
};

// function for mysql code allowing user to get the departments names!
const getDepartmentsNames = () => {
    return new Promise((resolve, reject) => {

        const sql = 'SELECT department_name FROM department;';

        // Execute the query
        db.query(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const names = rows.map((row) => `${row.department_name}`);
            resolve(names);
        });
    });
};

// function for mysql code allowing user to get the roles names!
const getRolesNames = () => {
    return new Promise((resolve, reject) => {

        const sql = 'SELECT title FROM role;';

        // Execute the query
        db.query(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const names = rows.map((row) => `${row.title}`);
            resolve(names);
        });
    });
};

// function for mysql code allowing user to view salary/budget by department!
const departmentUtilizedBudget = () => {
    return new Promise((resolve, reject) => {

        const sql = `SELECT department.department_name, SUM(role.salary) AS department_salary_sum FROM department LEFT JOIN role ON role.department_id = department.id GROUP BY department.department_name UNION SELECT 'Total' AS department_name, SUM(role.salary) AS department_salary_sum FROM role;`;

        // Execute the query
        db.query(sql, (err, rows) => {
            if (err) {
              throw new err
            }
            console.table(rows);
            console.log('\n');
        });
    });
};

// function to delete target department!
const deleteDepartment = (answers) => {
    const departmentName = answers.deleteDepartment;
  
    // Find the department ID based on the department name
    const sqlFindId = 'SELECT id FROM department WHERE department_name = ?';
    db.query(sqlFindId, [departmentName], (err, result) => {
      if (err) {
        throw err;
      }
  
      if (result.length === 0) {
        console.log(`Department "${departmentName}" does not exist.\n`);
        return;
      }
  
      const departmentId = result[0].id;
  
      // Delete the department based on the department ID
      const sqlDelete = 'DELETE FROM department WHERE id = ?';
      db.query(sqlDelete, [departmentId], (err, result) => {
        if (err) {
          throw err;
        }
  
        console.log(`Department "${departmentName}", all associated roles and employees, have been deleted.\n`);
      });
    });
};

// function to delete target role!
const deleteRole = (answers) => {
    const roleTitle = answers.deleteRole;
  
    // Find the role ID based on the role title
    const sqlFindId = 'SELECT id FROM role WHERE title = ?';
    db.query(sqlFindId, [roleTitle], (err, result) => {
      if (err) {
        throw err;
      }
  
      if (result.length === 0) {
        console.log(`Role "${roleTitle}" does not exist.\n`);
        return;
      }
  
      const roleId = result[0].id;
  
      // Delete the role based on the role ID
      const sqlDelete = 'DELETE FROM role WHERE id = ?';
      db.query(sqlDelete, [roleId], (err, result) => {
        if (err) {
          throw err;
        }
  
        console.log(`Role "${roleTitle}", and all associated employees, have been deleted.\n`);
      });
    });
};
  
// function to delete target employee!
const deleteEmployee = (answers) => {
    const fullName = answers.deleteEmployee;
    
    // Split the full name into first name and last name
    const [firstName, lastName] = fullName.split(' ');
  
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    // Find the employee ID based on the trimmed first and last name
    const sqlFindId = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?';
    db.query(sqlFindId, [trimmedFirstName, trimmedLastName], (err, result) => {
      if (err) {
        throw err;
      }
  
      if (result.length === 0) {
        console.log(`Employee "${fullName}" does not exist.\n`);
        return;
      }
  
      const employeeId = result[0].id;
  
      // Delete the employee based on the employee ID
      const sqlDelete = 'DELETE FROM employee WHERE id = ?';
      db.query(sqlDelete, [employeeId], (err, result) => {
        if (err) {
          throw err;
        }
  
        console.log(`Employee "${fullName}" has been deleted.\n`);
      });
    });
};
  


module.exports = {
    viewAllDepartments,
    viewAllRoles,
    viewAllEmployees,
    addNewDepartments,
    addNewRoles,
    addNewEmployees,
    updateEmployeeRole,
    getEmployeeNames,
    getDepartmentsNames,
    getRolesNames,
    departmentUtilizedBudget,
    deleteDepartment,
    deleteRole,
    deleteEmployee
};




// NOTE:
// now, I am unable to add roles or update employees, or even delete? Check WTF is going on...