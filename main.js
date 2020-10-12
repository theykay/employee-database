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
  add();
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
    }
    // ask if they want to add manager id, then handle based on that
  ])
    .then(answers => {
      console.log(answers)
      connection.query("INSERT INTO employees SET ?", answers, (err, data) => {
        if (err) throw err;
        console.log(`${answers.first_name} ${answers.last_name} added to database!`)
      })
    })
    .catch(err => {
      if (err) throw err;
    })
}
// ...role
const newRole = () => {

}
// ...department
const newDepartment = () => {
  inquirer.prompt([
    {
      type: "input",

    }
  ])
    .then(answers => {

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