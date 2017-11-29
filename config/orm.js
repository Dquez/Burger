// Import MySQL connection.
const connection = require("../config/connection.js");

// Helper function for SQL syntax.
// Let's say we want to pass 3 values into the mySQL query.
// In order to write the query, we need 3 question marks.
// The above helper function loops through and creates an array of question marks - ["?", "?", "?"] - and turns it into a string.
// ["?", "?", "?"].toString() => "?,?,?";
function printQuestionMarks(num) {
  let arr = [];

  for (let i = 0; i < num; i++) {
    arr.push("?");
  }

  return arr.toString();
}

// Helper function to convert object key/value pairs to SQL syntax
function objToSql(ob) {
  let arr = [];

  // loop through the keys and push the key/value as a string int arr
  for (let key in ob) {
    let value = ob[key];
    // check to skip hidden properties
    if (Object.hasOwnProperty.call(ob, key)) {
      // if string with spaces, add quotations (Lana Del Grey => 'Lana Del Grey')
      if (typeof value === "string" && value.indexOf(" ") >= 0) {
        value = "'" + value + "'";
      }
      // e.g. {name: 'Lana Del Grey'} => ["name='Lana Del Grey'"]
      // e.g. {sleepy: true} => ["sleepy=true"]
      arr.push(key + "=" + value);
    }
  }

  // translate array of strings to a single comma-separated string
  return arr.toString();
}

// Object for all our SQL statement functions.
const orm = {
  all: function(tableInput, cb) {
    let queryString = "SELECT * FROM " + tableInput + ";";
    connection.query(queryString, function(err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  },
  create: function(table, col, val, cb) {
    let queryString = "INSERT INTO " + table;

    queryString += " (";
    queryString += col.toString();
    queryString += ") ";
    queryString += "VALUES (";
    queryString += printQuestionMarks(val.length);
    queryString += ") ";

    console.log(queryString);

    connection.query(queryString, val, function(err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  },
  update: function(table, objColVal, condition, cb) {
    let queryString = "UPDATE " + table;
    queryString += " SET ";
    queryString += objToSql(objColVal);
    queryString += " WHERE ";
    queryString += condition;

    connection.query(queryString, function(err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  },
  // this function deletes from DB using the ID specified from the client, then adjusts the IDs in the DB to reflect the change i.e instead of 1,3,4,6 we'll have 1,2,3,4 now
  delete: function(table, condition, cb) {
    let queryString = "DELETE FROM " + table;
    queryString += " WHERE " + condition + "; ";
    queryString += "ALTER TABLE " +  table + " DROP id; "
    queryString += "ALTER TABLE " + table + " AUTO_INCREMENT = 1; "
    queryString += "ALTER TABLE " + table  + " ADD id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;"
    console.log(queryString);
    connection.query(queryString, condition, function (err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  }
};
module.exports = orm;