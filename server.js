// Import Data: mysql2 to use mysql code in js, and dotenv to pass sensitive information safely!
const mysql = require("mysql2");
require("dotenv").config();

//CONNECT TO THE LOCAL DATABASE
const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log(`Successfully connected to the database!\n`)
);

// function for mysql code allowing user to view all departments (id, name, manager)! 
// NOTE: this table also shows the corresponding manager for each department. This was not required specifically, but I found it to be more approriate if each department had only one managerial role. Hence, this table displays this. Additionally, the entire app was build around this. Hence, when adding employees or update their roles etc., we do not manually add their manager, instead it is all automated!
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
    } else if (rows.length === 0) {
      console.log("No departments available.\n");
      return;
    }

    console.table(rows);
    console.log("\n");
  });
};

// function for mysql code allowing user to view all roles: their ids, titles, salaries, and corresponding department!
const viewAllRoles = () => {
  const sql = `
        SELECT role.id, role.title, role.salary, department.department_name AS department
        FROM role
        INNER JOIN department ON role.department_id = department.id;
    `;

  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    } else if (rows.length === 0) {
      console.log("No roles available.\n");
      return;
    }

    console.table(rows);
    console.log("\n");
  });
};

// function for mysql code allowing user to view all employees: ids, first and last names, role, salary, department, and manager!
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
    } else if (rows.length === 0) {
      console.log("No employees available.\n");
      return;
    }

    console.table(rows);
    console.log("\n");
  });
};

// function for mysql code allowing user to add new departments. It requires a new department name from user input; if department name already exists, inform user, if not, added it!
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
      console.log(
        `A department with the name "${newDepartmentName}" already exists.\n`
      );
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

// function for mysql code allowing user to add new roles. It requires a new role title, a salary, and a department to attacht it to. Note that the department names are presented in a list from whatever departments the user has, if none are present, it informs user. When a department is chosen and a role title and a salary are added, it checks if the role already exists (specifically in that department; the role is allowed to exist in another department) and informs the user if it does, otherwise, simply add new role!
const addNewRoles = (answers) => {
  const newRoleTitle = answers.newRoleTitle;
  const newRoleSalary = answers.newRoleSalary;
  const newRoleDepartment = answers.newRoleDepartment;

  if (newRoleDepartment === "No departments available") {
    console.log(
      "The role cannot be added without a corresponding department!\n"
    );
    return;
  } else {
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

    db.query(
      roleCheckQuery,
      [newRoleTitle, newRoleDepartment],
      (err, result) => {
        if (err) {
          throw err;
        }

        const count = result[0].count;
        if (count > 0) {
          console.log(
            `A role with the title "${newRoleTitle}" already exists in the ${newRoleDepartment} department.\n`
          );
        } else {
          db.query(
            insertQuery,
            [newRoleTitle, newRoleSalary, newRoleDepartment],
            (err) => {
              if (err) {
                throw err;
              }
              console.log(`New role: ${newRoleTitle}, successfully added!\n`);
            }
          );
        }
      }
    );
  }
};

// function for mysql code allowing user to add new employees. It requires new employees first and last names, and then a role. Note that similar to the departments from before, the roles are presnted in a list, hence if there are none to chose from, the user is informed. Once a role is chosen, we check whether it contain the word "manager" which indicates that it is a managerial role, if it does, then we further check if the corresponding department already has a manager (recall, each role is connected to a certain department), if there is already one manager in that department, inform user, else proceed to add enw manager. If the new role is not a managerial role, add the employee normally.
const addNewEmployees = (answers) => {
  const newEmployeeFirstName = answers.newEmployeeFirstName;
  const newEmployeeLastName = answers.newEmployeeLastName;
  const newEmployeeRole = answers.newEmployeeRole;

  if (newEmployeeRole === "No roles available") {
    console.log("The employee cannot be added without a corresponding role!\n");
    return;
  } else {
    const roleDepartmentSplit = newEmployeeRole.split(",");
    const roleTitle = roleDepartmentSplit[0].trim();
    const departmentName = roleDepartmentSplit[1].trim();

    const role_ID = `SELECT id FROM role WHERE title = '${roleTitle}' AND department_id = (SELECT id FROM department WHERE department_name = '${departmentName}')`;
    const managerDepartmentID = `SELECT department_id FROM manager WHERE department_id = (SELECT id FROM department WHERE department_name = '${departmentName}')`;

    // Check if the role contains the word 'manager'
    if (roleTitle.toLowerCase().includes("manager")) {
      // Check if there is already a manager for the department
      db.query(managerDepartmentID, (err, result) => {
        if (err) {
          throw err;
        }

        if (result.length > 0) {
          console.log(
            "Managerial role is already occupied for this department!"
          );
        } else {
          const managerID = "NULL";
          const managerInsertSQL = `INSERT INTO manager (first_name, last_name, department_id) VALUES ('${newEmployeeFirstName}', '${newEmployeeLastName}', (SELECT id FROM department WHERE department_name = '${departmentName}'))`;

          db.query(managerInsertSQL, (err) => {
            if (err) {
              throw err;
            }

            console.log(
              `New manager: ${newEmployeeFirstName} ${newEmployeeLastName}, has been successfully added!\n`
            );

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
      const managerID = "NULL";

      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
      VALUES ('${newEmployeeFirstName}', '${newEmployeeLastName}', (${role_ID}), ${managerID})`;

      db.query(sql, (err) => {
        if (err) {
          throw err;
        }

        console.log(
          `New employee: ${newEmployeeFirstName} ${newEmployeeLastName}, has been successfully added to the role "${roleTitle}" in the "${departmentName}" department!\n`
        );
      });
    }
  }
};

// function for mysql code allowing user to update an employee's role. Requires name of employee to be updated, and the role to which they are being switched to. If the new role is a managerial one, the function makes sure that only one managerial role can exist within one department; so if someone else has that managerial role, it cannot be added. If not a manager, simply proceed with the update.
const updateEmployeeRole = (answers) => {
  const nameOfUpdatedEmployee = answers.nameOfUpdatedEmployee;
  const newRoleDepartmentInitial = answers.newRoleName;

  // used var so that the variable can be used outside the scope of the if statement!
  if (newRoleDepartmentInitial != undefined) {
    var newRoleDepartment = newRoleDepartmentInitial.split(",");
  }

  // if there are no employees, report that and return. NOTE: While there is an else if statement, it is currently useless since employees cannot exist without a role, and a role cannot exist without at least one employee. This is only kept for future use if the "company" decides to make it possible to add roles and keep them on hold or add employees and keeo them on hold. Anyhow, currently, if employees are present, the code proceeds as normal but if not it would stop and reports that!
  if (nameOfUpdatedEmployee === "No employees available") {
    console.log("No employees are available to be updated!\n");
    return;
  } else if (newRoleDepartment === "No roles available") {
    console.log(
      "The employees cannot be updated without a corresponding role!\n"
    );
    return;
  } else {
    const newRoleName = newRoleDepartment[0].trim();
    const departmentName = newRoleDepartment[1].trim();
    const isManager = newRoleName.toLowerCase().includes("manager");
    const names = nameOfUpdatedEmployee.split(" ");
    const firstName = names[0];
    const lastName = names[1];

    const roleIdQuery = `SELECT id FROM role WHERE title = '${newRoleName}' AND department_id = (SELECT id FROM department WHERE department_name = '${departmentName}')`;
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
          console.log(
            `A manager already exists for the department. Only one manager per department is allowed.\n`
          );
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

              console.log(
                `Employee "${nameOfUpdatedEmployee}" has been updated with a new managerial role, congrats!\n`
              );
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

        console.log(
          `Employee "${nameOfUpdatedEmployee}" has been updated with a new role.\n`
        );
      });
    }
  }
};

// function for mysql code allowing user to get the employees names. This generates a list of the full names to be later used as choices in some questions in inquirer!
const getEmployeeNames = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT first_name, last_name FROM employee;";

    db.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Extract first names and last names from the result rows and display them as full name together
      const names = rows.map((row) => `${row.first_name} ${row.last_name}`);
      // Sort the names array alphabetically
      names.sort((a, b) => a.localeCompare(b));
      // Resolve the promise with the sorted names array
      resolve(names);
    });
  });
};

// function for mysql code allowing user to get the departments names. This generates a list of the full names to be later used as choices in some questions in inquirer!
const getDepartmentsNames = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT department_name FROM department;";

    db.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Extract the names and sort them alphabitically
      const names = rows.map((row) => `${row.department_name}`);
      names.sort((a, b) => a.localeCompare(b));
      resolve(names);
    });
  });
};

// function for mysql code allowing user to get the role names. This generates a list of the full names to be later used as choices in some questions in inquirer!
const getRolesNames = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.title, d.department_name
      FROM role r
      JOIN department d ON r.department_id = d.id;
    `;

    db.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const names = rows.map((row) => `${row.title}, ${row.department_name}`); 
      names.sort((a, b) => a.localeCompare(b)); 
      resolve(names); 
    });
  });
};

// function for mysql code allowing user to view salary/budget for each department. It also gives the total for all department at the bottom row!
const departmentUtilizedBudget = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT department.department_name, SUM(role.salary) AS department_salary_sum FROM department LEFT JOIN role ON role.department_id = department.id GROUP BY department.department_name UNION SELECT 'Total' AS department_name, SUM(role.salary) AS department_salary_sum FROM role;`;

    db.query(sql, (err, rows) => {
      if (err) {
        throw new err();
      } else if (rows.length === 0) {
        console.log("No appropriate budget information available.\n");
        return;
      }

      console.table(rows);
      console.log("\n");
    });
  });
};

// function to delete target department. Uses list of department as options to choose from, if none exist, inform user. Otherwise, proceed. NOTE: the deletion of any department will delete all associated data with it. For example, roles and employees!
const deleteDepartment = (answers) => {
  const departmentName = answers.deleteDepartment;

  if (departmentName === "No departments available") {
    console.log("No departments available.\n");
    return;

  } else {
    const sqlFindId = "SELECT id FROM department WHERE department_name = ?";
    db.query(sqlFindId, [departmentName], (err, result) => {
      if (err) {
        throw err;
      }

      const departmentId = result[0].id;
      const sqlDelete = "DELETE FROM department WHERE id = ?";
      db.query(sqlDelete, [departmentId], (err, result) => {
        if (err) {
          throw err;
        }

        console.log(
          `Department "${departmentName}", all associated roles and employees, have been deleted.\n`
        );
      });
    });
  }
};

// function to delete target role. Uses list of roles as options to choose from, if none exist, inform user. Otherwise, proceed. NOTE: the deletion of any role will delete all associated employees! (But not departments: it's a cascade relationship where department can have more than one role but a role can only belong to one department!)
const deleteRole = (answers) => {
  const roleTitle = answers.deleteRole;

  if (roleTitle === "No roles available") {
    console.log("No roles available to be deleted!\n");
    return;
  } else {
    const roleTitleSplit = roleTitle.split(",");
    const roleTitleOnly = roleTitleSplit[0].trim();
    const departmentName = roleTitleSplit[1].trim();

    const sqlFindId = `
      SELECT r.id
      FROM role r
      JOIN department d ON r.department_id = d.id
      WHERE r.title = ? AND d.department_name = ?
    `;

    db.query(sqlFindId, [roleTitleOnly, departmentName], (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length === 0) {
        console.log(
          `Role "${roleTitleOnly}" in department "${departmentName}" does not exist.\n`
        );
        return;
      }

      const roleId = result[0].id;

      const sqlDelete = "DELETE FROM role WHERE id = ?";
      db.query(sqlDelete, [roleId], (err, result) => {
        if (err) {
          throw err;
        }

        console.log(
          `Role "${roleTitleOnly}" in department "${departmentName}", and all associated employees, have been deleted.\n`
        );
      });
    });
  }
};

// function to delete target employee. Check if manager, if yes, delete from BOTH employee and manager table. IF not, delete employee!
const deleteEmployee = (answers) => {
  const fullName = answers.deleteEmployee;

  if (fullName === "No employees available") {
    console.log("No employees available to be deleted!\n");
    return;
  } else {
    // Split the full name into first name and last name (taken as full name from choices, then separated because the tables in our database are built to require a first and a last name!)
    const names = fullName.split(" ");
    const firstName = names[0];
    const lastName = names[1];

    // Find the employee ID based on the trimmed first and last name
    const sqlFindId = `SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}'`;
    db.query(sqlFindId, (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length === 0) {
        console.log(`Employee "${fullName}" does not exist.\n`);
        return;
      }

      const employeeId = result[0].id;

      // Check if the employee has the word "manager" in their role title
      const sqlCheckManagerRole = `
        SELECT *
        FROM role
        WHERE id IN (
          SELECT role_id
          FROM employee
          WHERE id = ${employeeId}
        )
        AND title LIKE '%manager%';
      `;

      db.query(sqlCheckManagerRole, (err, managerResult) => {
        if (err) {
          throw err;
        }

        if (managerResult.length > 0) {
          // Delete the manager from both employee and manager tables:
          const sqlDeleteManagerAndEmployee = `
          DELETE manager
          FROM manager
          JOIN (SELECT id FROM manager WHERE first_name = '${firstName}' AND last_name = '${lastName}') AS m
            ON manager.id = m.id;
          `;

          const sqlDeleteEmployeeAndManager = `
          DELETE employee
          FROM employee
          JOIN (SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}') AS e
            ON employee.id = e.id;
          `;

          db.query(sqlDeleteEmployeeAndManager, (err, result) => {
            if (err) {
              throw err;
            }
          });

          db.query(sqlDeleteManagerAndEmployee, (err, result) => {
            if (err) {
              throw err;
            }

            console.log(`Manager "${fullName}" has been deleted.\n`);
          });
        } else {

          // Delete the employee
          const sqlDeleteEmployee = `
            DELETE employee
            FROM employee
            JOIN (SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}') AS e
              ON employee.id = e.id;
          
          `;
          db.query(sqlDeleteEmployee, (err, result) => {
            if (err) {
              throw err;
            }

            console.log(`Employee "${fullName}" has been deleted.\n`);
          });
        }
      });
    });
  }
};

// function for mysql code allowing user to get the manager names. This is then presented as a list for later use in inquirer.
const getManagerNames = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT first_name, last_name FROM manager;";

    db.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const names = rows.map((row) => ({
        name: `${row.first_name} ${row.last_name}`,
      }));

      // Sort the names array alphabetically by name
      names.sort((a, b) => a.name.localeCompare(b.name));
      resolve(names);
    });
  });
};

// function for mysql code allowing user to view employees working in a certain department. If no departments, report back, if the department has no employees, report to user, else display them!
const viewEmployeesByDepartment = (answers) => {
  const departmentName = answers.viewEmployeesByDepartment;

  if (departmentName === "No departments available") {
    console.log(
      "No departments available, hence cannot view corresponding employees!\n"
    );
    return;
  } else {
    const sql = `
    SELECT
    employee.id,
    employee.first_name,
    employee.last_name,
    role.title AS role,
    role.salary,
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
      employee AS emp ON emp.id = manager.id
    WHERE
      department.department_name = '${departmentName}';


    `;

    db.query(sql, (err, rows) => {
      if (err) {
        throw err;
      }

      if (rows.length === 0) {
        console.log(
          `The "${departmentName}" department has no active employees.\n`
        );
      } else {
        console.table(rows);
        console.log("\n");
      }
    });
  }
};

// function for mysql code allowing user to view employees working under a certain manager. If no managers, tell user. If no employees under a certain manager, report back, else display employees!
const viewEmployeesByManager = (answers) => {
  const managerName = answers.viewEmployeesByManager;
  const names = managerName.split(" ");
  const firstName = names[0];
  const lastName = names[1];

  if (managerName === "No managers available") {
    console.log(
      "No managers available, hence cannot view corresponding employees!\n"
    );
    return;
  } else {
    const sql = `
    SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title AS role,
      role.salary,
      department.department_name AS department
    FROM
      employee
    INNER JOIN
      role ON employee.role_id = role.id
    INNER JOIN
      department ON role.department_id = department.id
    WHERE
      department.id = (
        SELECT department_id
        FROM manager
        WHERE first_name = '${firstName}' AND last_name = '${lastName}'
      )
      AND role.title NOT LIKE '%manager%';
    `;

    db.query(sql, (err, rows) => {
      if (err) {
        throw err;
      }

      if (rows.length === 0) {
        console.log(`Manager "${managerName}" has no active employees.\n`);
      } else {
        console.table(rows);
        console.log("\n");
      }
    });
  }
};

// Exported functions
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
  deleteEmployee,
  getManagerNames,
  viewEmployeesByManager,
  viewEmployeesByDepartment,
};

// CHECKPOINT!!! ALL WORKS PERFECTLY