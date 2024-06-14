// config.js 
const mysql = require('mysql');
const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"workdiary",
    multipleStatements: true
});
con.connect((err)=>{
    if(err){
        console.log("error in connection");
    }
    else 
    {
        console.log("connection");
    }
})
module.exports = con;