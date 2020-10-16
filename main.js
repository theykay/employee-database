require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.mysql,
    database: "employees_db"
})

// console colors
const red = chalk.bold.red;
const green = chalk.bold.green;
const yellow = chalk.bold.yellow;
const blue = chalk.bold.yellow;
const magenta = chalk.bold.magenta;
const cyan = chalk.bold.cyan;
const grey = chalk.bold.grey;

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
    main();
});

// **********************************************
// week 12 activity 10 for using sql tables to
// populate inquirer prompt choices in list type
// **********************************************
// week 12 activity 5 for joining tables
// **********************************************

const main = async () => {
    var response = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                { name: "View departments, roles, or employees", value: 1 },
                { name: "Add a department, role, or employee", value: 2 },
                { name: "Update employee roles", value: 3 },
                { name: "Close", value: 4}]
        }
    ]);
    if (response.action === 1) {
        view();
    } else if (response.action === 2) {
        add();
    } else if (response.action === 3) {
        update();
    } else if (response.action === 4) end();
};

// add...
const add = async () => {
    var addition = await inquirer.prompt([
        {
            type: "list",
            name: "type",
            message: "What new data would you like to add?",
            choices: ["department", "role", "employee"]
        }
    ]);
    const { type, confirm } = addition;


    if (type === "employee") {
        let roleDataExists;
        connection.query("SELECT * FROM roles", (err, data) => {
            if (err) throw err;
            if (data.length > 0) roleDataExists = true;
            else roleDataExists = false;
            return roleDataExists;
        });
        if (roleDataExists === false) {
            console.log(red("Error: There must be at least one role before you can add an employee"));
            console.log("Returning to addition main...")
            add();
        } else {
            newEmployee();
        };
    } else if (type === "role") {
        let departmentDataExists;
        connection.query("SELECT * FROM departments", (err, data) => {
            if (err) throw err;
            if (data.length > 0) departmentDataExists = true;
            else departmentDataExists = false;
            return departmentDataExists;
        });
        if (departmentDataExists === false) {
            console.log(red("Error: There must be at least one department before you can add a role"));
            console.log("Returning to addition main...");
            add();
        } else {
            newRole();
        }
    } else if (type === "department") {
        newDepartment();
    };
};

// ...employee
const newEmployee = async () => {
    let options = [];
    connection.query("SELECT * FROM roles", (err, data) => {
        if (err) throw err;
        data.forEach((entry) => {
            let name = entry.title;
            let value = entry.id;
            options.push({ name, value });
        });
        return options;
    });

    let managers = [{ name: "none", value: null }];
    connection.query("SELECT * FROM employees", (err, data) => {
        if (err) throw err;
        data.forEach((entry) => {
            let name = entry.first_name + " " + entry.last_name;
            let value = entry.id;
            managers.push({ name, value });
        });
        return managers;
    });

    var info = await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "Enter first name: ",
            validate: (input) => {
                const passing = input.match(/^[a-z]+$/gi);
                if (!passing) return false;
                return true;
            }
        },
        {
            type: "input",
            name: "last_name",
            message: "Enter last name: ",
            validate: input => {
                const passing = input.match(/^[a-z]+$/gi);
                if (!passing) return false;
                return true;
            }
        },
        {
            type: "list",
            name: "role_id",
            message: "Select a role: ",
            choices: options
        },
        {
            type: "list",
            name: "manager_id",
            message: "Select a manager: ",
            choices: managers
        }
    ]);
    connection.query("INSERT INTO employees SET ?", info, (err) => {
        if (err) throw err;
        console.log(`${info.first_name} ${info.last_name} added to employees!`)
    });
    main();
};
// ...role
const newRole = async () => {
    let departments = [];
    connection.query("SELECT * FROM departments", (err, data) => {
        if (err) throw err;
        data.forEach((entry) => {
            let name = entry.department_name;
            let value = entry.id;
            departments.push({ name, value });
        });
        return departments;
    });
    var info = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter name of role: ",
            validate: (input) => {
                const passing = input.match(/^[a-z\s]+$/gi);
                if (!passing) return false;
                return true;
            }
        },
        {
            type: "input",
            name: "salary",
            message: "Enter salary",
            validate: (input) => {
                const passing = input.match(/^\d+$/g);
                if (!passing) return false;
                return true;
            }
        },
        {
            type: "list",
            name: "department_id",
            message: "select a department to put this role into: ",
            choices: departments
        }
    ]);
    connection.query("INSERT INTO roles SET ?", info, (err) => {
        if (err) throw err;
        console.log(`${info.title} added to roles!`)
    });
    main();
}
// ...department
const newDepartment = async () => {
    var info = await inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "Input department name: ",
            validate: (input) => {
                const passing = input.match(/^[a-z\s]+$/gi);
                if (!passing) return false;
                return true;
            }
        }
    ]);
    connection.query("INSERT INTO departments SET ?", info, (err) => {
        if (err) throw err;
        console.log(`${info.department_name} added to departments!`)
    });
    main();
};

// view tables
const view = async () => {
    var response = await inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Which table would you like to view?",
            choices: ["departments", "roles", "employees"]
        }
    ])
    let { choice } = response;
    if (choice === "departments") {
        connection.query("SELECT * FROM departments", (err, data) => {
            if (err) throw err;
            console.log("\nFetching data...\n");
            console.table(data);
        })
    } else if (choice === "roles") {
        connection.query("SELECT roles.id, title, salary, department_name FROM roles LEFT JOIN departments ON roles.department_id = departments.id;", (err, data) => {
            if (err) throw err;
            console.log("\nFetching data...\n");
            console.table(data);
        });
    } else if (choice === "employees") {
        connection.query("SELECT e.id, e.first_name, e.last_name, title, department_name, salary, IFNULL(CONCAT(m.first_name, ' ', m.last_name), ' ') AS manager FROM employees e LEFT JOIN roles ON e.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees m ON e.id = m.manager_id;", (err, data) => {
            if (err) throw err;
            console.log("\nFetching data...\n");
            console.table(data);
        })
    };
    main();
};

const update = async () => {
    let employees = [];
    connection.query("SELECT * FROM employees", (err, data) => {
        if (err) throw err;
        // console.log(data);
        data.forEach((entry) => {
            let name = entry.first_name + " " + entry.last_name;
            let value = entry.id;
            let employee = {
                name: name,
                value: value
            }
            employees.push(employee);
        });
        // console.log(employees);
        return employees;
    });

    let roles = [];
    connection.query("SELECT * FROM roles", (err, data) => {
        if (err) throw err;
        data.forEach(entry => {
            let name = entry.title;
            let value = entry.id;
            let role = {
                name: name,
                value: value
            }
            roles.push(role);
        })
        // console.log(roles);
        return roles;
    });

    var choice = await inquirer.prompt([
        {
            type: "list",
            name: "pick",
            message: "What info would you like to update?",
            choices: ["manager", "role", "both"]
        }
    ]);
    // var questions = [];
    if (choice.pick === "manager") {
        var info = await inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Whose role would you like to update?",
                choices: employees
            },
            {
                type: "list",
                name: "manager_id",
                message: "Select a manager",
                choices: employees
            }
        ])
        let name;
        connection.query("SELECT * FROM employees WHERE ?", [{ id: info.id }], (err, data) => {
            if (err) throw err;
            name = data[0].first_name + " " + data[0].last_name;
        });
        let manager;
        connection.query("SELECT * FROM employees WHERE ?", [{ id: info.manager_id }, (err, data) => {
            if (err) throw err;
            manager = data[0].first_name + " " + data[0].last_name;
        }])
        connection.query("UPDATE employees SET ? WHERE ?", [{ manager_id: info.manager_id }, { id: info.id }], (err) => {
            if (err) throw err;
            console.log(name + "\'s manager updated to " + manager + "!");
        });
    } else if (choice.pick === "role") {
        var info = await inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Whose role would you like to update?",
                choices: employees
            },
            {
                type: "list",
                name: "role",
                message: "Select new role",
                choices: roles
            }
        ]);
        let name;
        connection.query("SELECT * FROM employees WHERE ?", [{ id: info.id }], (err, data) => {
            if (err) throw err;
            name = data[0].first_name + " " + data[0].last_name;
        });
        connection.query("UPDATE employees SET ? WHERE ?", [{ role_id: info.role }, { id: info.id }], (err) => {
            if (err) throw err;
            console.log(name + "\'s role updated to " + info.role.name + "!");
        });
    } else if (choice.pick === "both") {
        var info = await inquirer.prompt([

            {
                type: "list",
                name: "id",
                message: "Whose role would you like to update?",
                choices: employees
            },
            {
                type: "list",
                name: "manager_id",
                message: "Select a manager",
                choices: employees
            },
            {
                type: "list",
                name: "role",
                message: "Select new role",
                choices: roles
            }
        ]);
        let name;
        let role = info.role.name;
        connection.query("SELECT * FROM employees WHERE ?", [{ id: info.id }], (err, data) => {
            if (err) throw err;
            name = data[0].first_name + " " + data[0].last_name;
        });
        let manager;
        connection.query("SELECT * FROM employees WHERE ?", [{ id: info.manager_id }, (err, data) => {
            if (err) throw err;
            manager = data[0].first_name + " " + data[0].last_name;
        }])
        connection.query("UPDATE employees SET ? WHERE ?", [{ role_id: info.role, manager_id: info.manager_id }, { id: info.id }], (err) => {
            if (err) throw err;
            console.log(name + "\'s manager updated to " + manager + "!")
            console.log(name + "\'s role updated to " + role + "!");
        });
    }
    main();
}

const end = () => {
    console.log("Closing...");
    process.exit();
}