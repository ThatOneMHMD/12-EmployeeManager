-- Seed our database (fill it with random data)

USE employeeManager_DB;

-- Insert departments
INSERT INTO department (department_name) 
VALUES
  ('Marketing'),
  ('Finance'),
  ('Human Resources'),
  ('Sales'),
  ('Engineering');

-- Insert roles
INSERT INTO role (title, salary, department_id)
VALUES
  ('Marketing Manager', 120000, 1),
  ('Marketing Agent', 100000, 1),
  ('Financial Analyst Manager', 120000, 2),
  ('Financial Analyst', 100000, 2),
  ('HR Team Manager', 140000, 3),
  ('HR Coordinator', 80000, 3),
  ('Sales Manager', 120000, 4),
  ('Sales Representative', 90000, 4),
  ('Software Engineer Manager', 160000, 5),
  ('Software Engineer', 140000, 5);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id)
VALUES
  -- Department 1 (Marketing)
  ('John', 'Doe', 1),                  -- Marketing Manager
  ('Jane', 'Smith', 2),
  ('David', 'Johnson', 2),
  
  -- Department 2 (Finance)
  ('Emily', 'Williams', 3),             -- Finance Manager
  ('Michael', 'Brown', 4),
  ('Sarah', 'Davis', 4),
  
  -- Department 3 (HR)
  ('Robert', 'Miller', 5),              -- HR Manager
  ('Jennifer', 'Wilson', 6),
  ('William', 'Jones', 6),
  
  -- Department 4 (Sales)
  ('Jessica', 'Taylor', 7),             -- Sales Manager
  ('Daniel', 'Anderson', 8),
  ('Olivia', 'Martinez', 8),
  
  -- Department 5 (Engineering)
  ('Christopher', 'Thomas', 9),         -- Engineering Manager
  ('Sophia', 'Garcia', 10),
  ('Andrew', 'Rodriguez', 10);

-- Insert managers 
INSERT INTO manager (first_name, last_name, department_id)
VALUES
  ('John', 'Doe', 1),                  -- Marketing Manager
  ('Emily', 'Williams', 2),             -- Finance Manager
  ('Robert', 'Miller', 3),              -- HR Manager
  ('Jessica', 'Taylor', 4),             -- Sales Manager
  ('Christopher', 'Thomas', 5);         -- Engineering Manager