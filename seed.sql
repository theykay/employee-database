USE employees_db;

INSERT INTO departments (department_name)
VALUES ("security"),
("payroll"),
("human resources"),
("research and development"),
("grunts");

INSERT INTO roles (title, salary, department_id)
VALUES ("security guard", 60000, 1),
("payroll clerk", 50000, 2),
("hr rep", 50000, 3),
("researcher", 60000, 4),
("intern", 40000, 5);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Frances", "McDormund", 1),
("Daniel", "Radcliffe", 1),
("John", "Smith", 2),
("Debbie", "Reynolds", 2),
("Judy", "Garland", 3),
("Carol", "Burnett", 3),
("Bernadette", "Peters", 4),
("David", "Tennant", 4),
("Peter", "Capaldi", 5),
("Bill", "Nighy", 5);

UPDATE employees
SET manager_id = 8
WHERE first_name = "Peter" OR first_name = "Bill";