//app.js

const express = require('express');
const app = express();
const con = require('./config');
const path = require('path');
const url = require('url');
const alert = require('alert');
var _ = require('lodash-contrib');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');


app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.get('/analysys',(req,res)=>{
    res.render('analysis.ejs')
})
app.post('/signup',(req,res)=>{
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const pw = req.body.password;
    var sqlver = "SELECT * FROM signup where email = '"+email+"'";
    con.query(sqlver,(err,resu)=>{
        if(name == ''||email == ''||pw==''){
            alert("Please fill all the fields")
        }
        else if(resu.length>0){
            alert("This account is already registered please login")
        }
        else{
            var sql = "INSERT INTO signup(name,email,password)VALUES('"+name+"','"+email+"','"+pw+"')";
            con.query(sql,(err,result)=>{
                if(err){console.log("error occurred");}
                alert("Registration successful");
                res.redirect('login')
            })
        }
    })
    
   
})
var email;
app.post('/login',(req,res)=>{
    console.log(req.body);
    email = req.body.email;
    var pw = req.body.password;
    if(email&&pw){
        con.query('select * from signup where email = ? and password = ?',[email,pw],(err,resu,fields)=>{
            if(resu.length>0){
                res.redirect('home')
            }
            else{
                res.redirect('login')
                alert("Incorrect email and password");
            }
        });
    }
    else{
        res.redirect('login')
        alert("Incorrect email and password");
    }
    
})
var date;
app.post('/home',(req,res)=>{
    console.log(req.body);
    if(req.body.date=='')
    date=date;
else
    date = req.body.date;
    res.render('addtask.ejs')
})
app.get('/home',(req,res)=>{
    if(date == null){
        date = new Date();
        let d = ("0" + (date.getDate())).slice(-2);
        let m = ("0" + (date.getMonth()+1)).slice(-2);
        let y = date.getFullYear();
        date = y+"-"+m+"-"+d;
        console.log(date);
    }
    var sql = "SELECT sl,task,starttime,endtime,productive FROM task where email = ? and datevalue = ?";
    con.query(sql,[email,date],function(err,result1){
        if(err){console.log(err)};
        res.render('home',{task:result1});
        
        
    })
    
})
app.post('/addtask',(req,res)=>{
    console.log(req.body);
    const task = req.body.task; 
    var start = req.body.start;
    var started = start;
    var productive;
    if(req.body.productive){
        productive = 1;
    }
    else{
        productive = 0;
    }
    start = start+':00';
    //console.log(start);
    var sql = "INSERT INTO task(datevalue,task,starttime,productive,email)VALUES('"+date+"','"+task+"','"+start+"','"+productive+"','"+email+"')";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        alert("Task added");
        //res.redirect('login')
    })
    var sl;
    var sle;
    var ser;
    con.query('select sl from task where starttime = ? and email = ?',[start,email],(err,result,fields)=>{
        ser = JSON.parse(JSON.stringify(result));
      //  console.log(result);
        sle = ser[0].sl;
        //console.log(sle);
       // console.log(email);
        sle = parseFloat(ser[0].sl);
        console.log(sle);
        sl = sle-1;
        sl = Number(sl);
        console.log(sl);
        //var sqle = "UPDATE  task SET endtime = '"+start+"' WHERE sl = ? and email = ?";
        con.query('UPDATE  task SET endtime = ? WHERE sl = ? and email = ?',[start,sl,email],(error,result1)=>{
            console.log(email);
        if(error)throw error;
       
    })
   // var dur;
   
    con.query('select TIME_TO_SEC(timediff(endtime,starttime)) as dur from task where sl = ? and email = ?',[sl,email],(err1,result2)=>{
        console.log(result2);
        if(sl == 0) var duration = 0;
        else{
        var dur = JSON.parse(JSON.stringify(result2));
        console.log(dur);
        duration  = dur[0].dur;
        console.log(duration);
        }
        // dur = dur[0].TIME_TO_SEC(timediff(endtime,starttime));
        duration = Number(duration);
        // if(err1) throw err1;
        con.query('UPDATE task SET duration  = ? where sl = ? and email = ?',[duration,sl,email],(err2,result3)=>{
            if(err2) throw err2;
            res.redirect('home');
        })
       // res.redirect('home');
    })
     });
 //   res.redirect('home');
    
})
function toHoursAndMinutes(dursum) {
    const totalMinutes = Math.floor(dursum / 60);
  
    const seconds = dursum % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return { h: hours, m: minutes, s: seconds };
  }
app.post('/analyse',(req,res)=>{
   console.log(date);
    console.log(email);
    con.query('Select SUM(duration) as dur from task where datevalue = ? and email = ? and productive = ?',[date,email,Number(1)],(err,result)=>{
        if(err) throw err;
        console.log(result);
        var sumdur = JSON.parse(JSON.stringify(result));
        console.log(sumdur);
        dursum  = sumdur[0].dur;
        console.log(dursum);
        var timepre;
        var time = toHoursAndMinutes(dursum);
        con.query('SELECT DATE_SUB(?,INTERVAL 1 DAY) as datesub',[date],(err3,result4)=>{
            if(err3)throw err3;
            console.log(result4);
            var predate = JSON.parse(JSON.stringify(result4));
            var datepre  = predate[0].datesub;
            con.query('Select SUM(duration) as durpre from task where datevalue = ? and email = ? and productive = ?',[datepre,email,Number(1)],(err5,result6)=>{
                if(err5) throw err5;
                console.log(result6);
                var predur = JSON.parse(JSON.stringify(result6));
                console.log(predur);
                durpre  = predur[0].durpre;
                console.log(durpre);
                timepre = toHoursAndMinutes(durpre);
                var dh = timepre.h-time.h;
                var dm = timepre.m-time.m;
                // var dtime = {h:dh,m:dm,s:"00"};
                var durt = dursum - durpre;
                var diftime;
                if(_.isNegative(durt)){
                    var stmt = "You were more productive yesterday by";
                    durt = Math.abs(durt);
                    diftime = toHoursAndMinutes(durt);
                }
                else{
                    var stmt = "You are more productive today by ";
                    diftime = toHoursAndMinutes(durt);
                }
                var dtime = {stmt,diftime};
                res.render('analysis',{time,timepre,dtime});
            })
        })
       
    })
})
app.get('/',(req,res)=>{
    // var sql = "SELECT sl,task,starttime,endtime,productive FROM task where email = ?";
    // con.query(sql,email,function(err,result){
    //     if(err){console.log(err)};
    //     res.render('home',{task:result});
        
        
    // })
    res.render('login.ejs')
})

app.listen(3000);