require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const table = require("table");

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
  initial();
});

// **********************************************
// **********************************************
// week 12 activity 10 for using sql tables to
// populate inquirer prompt choices in list type
// **********************************************
// **********************************************
// week 12 activity 5 for joining tables
// **********************************************
// **********************************************
// **********************************************
// **********************************************
// **********************************************
// **********************************************
// **********************************************



const initial = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {name: "View departments, roles, or employees", value: 1},
        {name: "Add a department, role, or employee", value: 2}, 
        {name: "Update employee roles", value: 3}]
    }
  ])
  .then(answers => {
    if (answers.action === 1) {
      view();
    } else if (answers.action === 2) {
      add();
    } else if (answers.action === 3) {
      update();
    }
    // switch (answers.action) {
    //   case 1:
    //     add();
    //     break;
    //   case 2:
    //     view();
    //     break;
    //   case 3:
    //     update();
    //     break;
    // }
    initial();
  })
  .catch(err => {
    if (err) throw err;
  });
}

const valid = (err, data, variable) => {
  if (err) throw err;
  if (data.length === 0) {
    variable = false;
  } else {
    variable = true;
  }
  return variable;
}

// add...
const add = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "What new data would you like to add?",
      choices: ["department", "role", "employee"]
    }
  ])
    .then(answers => {
      const { type } = answers;
      let roleDataExists;
      let departmentDataExists;
      connection.query("SELECT * FROM roles", (err, data) => valid(err, data, roleDataExists));
      connection.query("SELECT * FROM departments", (err, data) => valid(err, data, departmentDataExists));
      if (type === "employee") {
        if (roleDataExists === false) {
          console.log("Error: There must be at least one role before you can add an employee");
          add();
        }
        newEmployee();
      } else if (type === "role") {
        if (departmentDataExists === false) {
          console.log("Error: There must be at least one department before you can add a role");
          add();
        }
        newRole();
      } else if (type === "department") {
        newDepartment();
      };
    })
    .catch(err => {
      if (err) throw err;
    })
}
// ...employee
const newEmployee = () => {
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

  let managers = [{name: "none", value: null}];
  connection.query("SELECT * FROM employees", (err, data) => {
    if (err) throw err;
    data.forEach((entry) => {
      let name = entry.first_name + " " + entry.last_name;
      let value = entry.id;
      managers.push({ name, value });
    });
    return managers;
  });

  inquirer.prompt([
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
      choices: options
    },
    {
      type: "list",
      name: "manager_id",
      message: "Select a manager: ",
      choices: managers
    }
  ])
    .then(answers => {
      connection.query("INSERT INTO employees SET ?", answers, (err) => {
        if (err) throw err;
        console.log(`${answers.first_name} ${answers.last_name} added to employees!`)
      })
    })
    .catch(err => {
      if (err) throw err;
    })
}
// ...role
const newRole = () => {
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
  inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter name of role: ",
      validate: (input) => {
        const passing = input.match(/^[a-z]+$/gi);
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
  ])
  .then(answers => {
    connection.query("INSERT INTO roles SET ?", answers, (err) => {
      if (err) throw err;
      console.log(`${answers.title} added to roles!`)
    })
  })
  .catch(err => {
    if (err) throw err;
  })
}
// ...department
const newDepartment = () => {
  inquirer.prompt([
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
  ])
    .then(answers => {
      connection.query("INSERT INTO departments SET ?", answers, (err) => {
        if (err) throw err;
        console.log(`${answers.department_name} added to departments!`);
      })
    })
    .catch(error => {
      if (error) throw error;
    });
}

// view tables
const view = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Which table would you like to view?",
      choices: ["departments", "roles", "employees"]
    }
  ])
    .then(answers => {
      let { choice } = answers;
      switch (choice) {
        case "departments":
          connection.query("SELECT * FROM departments", (err, data) => {
            if (err) throw err;
            console.table(data);
          })
          break;
        case "roles":
          connection.query("SELECT * FROM roles", (err, data) => {
            if (err) throw err;
            console.table(data);
          });
          break;
        case "employees":
          connection.query("SELECT * FROM employees", (err, data) => {
            if (err) throw err;
            console.table(data);
          })
          break;
      };
    })
    .catch(error => {
      if (error) throw error;
    });
};

const update = () => {
  let employees = [];
  connection.query("SELECT * FROM employees", (err, data) => {
    if (err) throw err;
    data.forEach((entry) => {
      let name = entry.first_name + " " + entry.last_name;
      let value = entry.id;
      employees.push({name, value});
    });
    return employees;
  });

  let roles = [];
  connection.query("SELECT * FROM roles", (err, data) => {
    if (err) throw err;
    data.forEach((entry) => {
      let name = entry.title;
      let value = entry.id;
      roles.push({name, value});
    })
    return roles;
  });

  inquirer.prompt([
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
  ])
  .then((answers) => {
    let name;
    connection.query("SELECT * FROM employees WHERE ?", [{id: answers.id}], (err, data) => {
      if (err) throw err;
      name = data.first_name + " " + data.last_name;
    });
    connection.query("UPDATE employees SET ? WHERE ?", [{role: answers.role},{id: answers.id}], (err) => {
      if (err) throw err;
      console.log(name + "\'s role updated to " + answers.role.name + "!");
    })
  })
  .catch((err) => {
    if (err) throw err;
  });
}