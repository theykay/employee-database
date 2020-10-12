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

connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);
  });

  view();

  function view() {
    inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Which table would you like to view?",
        choices: ["departments", "roles", "employees"]
      }
    ])
    .then( answers => {
      let { choice }  = answers;
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
    .catch( error => {
      if (error) throw error;
    })
  }