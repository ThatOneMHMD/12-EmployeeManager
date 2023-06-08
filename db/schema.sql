-- MYSQL/Database code

-- Drop Database if existed before then make it again. Then USE it!
DROP DATABASE IF EXISTS employeeManager_DB;
CREATE DATABASE employeeManager_DB;
USE employeeManager_DB;

-- Create "department" table with specified columns (id, department_name).... same method used to create other tables, columns differ...
CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT,

  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE CASCADE
);

CREATE TABLE manager (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  department_id INT,

  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE CASCADE
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,

  FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES manager(id) ON DELETE SET NULL
);
