var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "hr_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: ["Add Department", 
                "Add Roles", 
                "Add Employees", 
                "View Department", 
                "View Roles", 
                "View Employees", 
                "Update Employees",
                "Exit"]
    })
    .then(function(answer) {
      
      switch (answer.action) {
        case "Add Department":
          addDepartment();
          break;
  
        case "Add Roles":
          addRole();
          break;
  
        case "Add Employees":
          addEmployee();
          break;
  
        case "View Department":
          viewDepartment();
          break;
        
        case "View Roles":
          viewRoles();
          break;

        case "View Employees":
          viewEmployees();
          break;

        case "Update Employees":
          updateEmployee();
          break;

        case "Exit":
          connection.end();
          break;
        }
    });
}

function viewDepartment() {
  
  connection.query("SELECT * FROM department", function(err, res) {
    
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].id + " | " + res[i].name);
    }
    console.log("-----------------------------------");
    start();
  });
}

function viewRoles() {
  connection.query("SELECT * FROM role", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].id + " | " + res[i].title + " | " + res[i].salary);
    }
    console.log("-----------------------------------");
    start();
  });
}


function viewEmployees() {
  connection.query("SELECT * FROM employee LEFT JOIN role on employee.role_id = role.id", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].id + " | " + res[i].first_name + " | " + res[i].last_name + " | " + res[i].title);
    }
    console.log("-----------------------------------");
    start();
  });
}

function addDepartment() {
  inquirer
    .prompt([{
      name: "department",
      type: "input",
      message: "What department would you like to add?"      
    }])
    .then(function(answer) {
      connection.query("INSERT INTO department SET ?", 
      {name: answer.department}, function(err, res) {
        if (err) throw err;        
        console.log("-----------------------------------");
        start();
      });
    })  
}

function addRole() {
  inquirer
    .prompt([{
      name: "role",
      type: "input",
      message: "What role would you like to add?"      
    }, {
      name: "salary",
      type: "input",
      message: "What should be the salary?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }])
    .then(function(answer) {
      connection.query("INSERT INTO role SET ?", 
      {title: answer.role,
      salary: answer.salary}, function(err, res) {
        if (err) throw err;        
        console.log("-----------------------------------");
        start();
      });
    })
}

function addEmployee() {
  //retrieve all roles from role table
  connection.query("SELECT * FROM role", function (err, results) {    
    if (err) throw err;
    //get information about employee
    inquirer
      .prompt([{
        name: "first_name",
        type: "input",
        message: "What is the employee's first name?"
      }, {
        name: "last_name",
        type: "input",
        message: "What is the employee's last name?"
      },{
        name: "role", 
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for(var i =0; i < results.length; i++) {
            choiceArray.push(results[i].id + "|" + results[i].title)
          }
          return choiceArray;
        },
        message: "What role should the employee have?"
      }])
      .then(function(answer) {        
        connection.query("INSERT INTO employee SET ?", 
        {first_name: answer.first_name,
        last_name: answer.last_name,
        role_id:parseInt(answer.role[0]) || 1}, function(err, res) {
          if (err) throw err;        
          console.log("-----------------------------------");
          start();
        });
      })
  })
}

function updateEmployee() {
  //retrieve all employees from role table
  connection.query("SELECT * FROM employee", function (err, results) {    
    if (err) throw err;
    //get information about employee
    inquirer
      .prompt([{        
        name: "employee", 
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for(var i =0; i < results.length; i++) {
            choiceArray.push(results[i].id + " | " + results[i].first_name + 
            " " + results[i].last_name
            )}
          return choiceArray;
        },
        message: "What employee would you like to update?"
      }])
      .then(function(answer) {
        //retrieve all roles from role table
        connection.query("SELECT * FROM role", function (err, results) {
          if (err) throw err;
          //get information about employee
          inquirer
            .prompt([{
              name: "role", 
              type: "rawlist",
              choices: function() {
                var choiceArray = [];
                for(var i =0; i < results.length; i++) {
                  choiceArray.push(results[i].id + "|" + results[i].title)
                }
                return choiceArray;
              },
              message: "What role should the employee have?"
            }]).then(function(results) {
              
              connection.query("UPDATE employee SET ? WHERE ?",
              [
                {role_id: parseInt(results.role[0])},
                 {id: parseInt(answer.employee[0])}
              ],
              function(error) {
                if (error) throw err;
                start();
              }) 
            })
        })        
      })
  }) 
}