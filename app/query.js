
const mysql = require('mysql');
const memberDBconfig = require('../config/memberDB');
const connection = mysql.createConnection(memberDBconfig.connection);
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const multer = require('multer');

module.exports=function(app){

connection.query('USE ' + memberDBconfig.database);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
   }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination : './public/images/upload_images',
  filename: function(req,file,cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage,
  limits:{fileSize: 5000000},
  fileFilter:function(req,file,cb){
    checkFileType(file,cb);
  }
}).single('member_image');

// check file type function
function checkFileType(file,cb) {
  //allowed extensions
  const fileTypes = /jpeg|jpg|png|gif/;
  // check extension
  const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  //check mimetype
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extName) {
    return cb(null,true);
  } else {
    cb("ERROR:Images only!")
  }
};
try{
// +++++++++++++++++++++++++++++upload picture and insert info into database+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.post('/insert',(req,res)=>{
  const insert = "INSERT INTO member SET ?";
  
  upload(req,res,(err)=>{
    const member = {
      // capitalise the first letter of the names
    firstname: req.body.firstname.charAt(0).toUpperCase() + req.body.firstname.slice(1),
    lastname: req.body.lastname.charAt(0).toUpperCase() + req.body.lastname.slice(1),
    phone: req.body.Phone,
    dob: req.body.DOB,
    image: req.file.filename
  };
      if (err) {
          res.render('profile',{msg:err});
          
      }else{
          connection.query(insert,member,(err,results)=>{
        if(err){
          console.log(err.sqlMessage)
          res.render("error",{err:err.sqlMessage});
        }
        else{
        res.redirect("profile");
        }
      })
      }
      
  });
});

// ++++++++++++++++++++++++++++++++++++display all users using bootsratp datatables++++++++++++++++++++++++++++++++++++++++
app.get("/members",(req,res)=>{
  const select_all_member = "SELECT * FROM member order by Firstname";
  connection.query(select_all_member,(err,results)=>{
    if (err){
     console.log (err.sqlMessage);
    }
    let all_members = [];
    for(let i = 0; i < results.length; i++){
        all_members.push(results[i])
    }
    res.render("display",{data:all_members})
  })

});

app.post("/search",(req,res)=>{
  const search = `SELECT * FROM member where FirstName = '${req.body.firstname}' OR LastName = '${req.body.lastname}'`;
  connection.query(search,(err,results)=>{
    if(err){
      console.log(err.sqlMessage)
    }
    let members = [];
    for(let i = 0; i < results.length; i++){
      members.push(results[i])
      console.log(members)
    }
    res.render("search_page",{data:members})
  })
});
// +++++++++++++++++++++++++++++++DELETE MEMBER++++++++++++++++++++++++++++++++++++++++++++++
app.post("/delete",(req,res)=>{
const deleteMember = `DELETE FROM MEMBER WHERE Firstname = '${req.body.firstname}' and Lastname = '${req.body.lastname}'`;
connection.query(deleteMember,(err,results)=>{
  if (err) {
    console.log(err.sqlMessage)
  }
  else{
    console.log(results)
  res.redirect("members")
  }
})
});
}
catch (error) {
  res.render("error",{err:err.sqlMessage});
  console.log(error)
}
}