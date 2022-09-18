const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const flash = require('connect-flash');
const conn = require('../src/db/conn')
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session)

require('dotenv').config();
const Register = require('./models/register')

 jwt = require('jsonwebtoken');
 if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }

const PORT = process.env.PORT;
const app = express();

const templetsPath = path.join(__dirname,"../templets/views");
const partialsPath = path.join(__dirname, "../templets/partials");

app.use(flash())
app.use("/public", express.static('public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine', "hbs");
app.set("views",templetsPath);
hbs.registerPartials(partialsPath);

const store = new MongodbSession({
    uri:conn.MongoUri,
    collection:"mySession"
});

app.use(session({
    secret:"Key that will sign cookies",
    resave:false,
    saveUninitialized:false,
    store:store
}));

const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/')
    }
};



//====================== LANDING PAGE SECTIN START HERE =================================
app.get("/", async(req, res) => {

    var mecdata = await Register.mechanicRegister.find({}).exec();

      res.render("landing",{mdata:mecdata})    
});
//====================== LANDING PAGE SECTIN END HERE ===================================

    
//====================== USER PAGE SECTION START HERE ===================================
//======= USER LOGIN ==========
app.get("/login", (req, res) => {
    res.render("login",{message:req.flash('message')})
});
app.post("/login", async (req, res) => {
    try{
        const email =req.body.email;
        const password =req.body.password;
       const useremail = await Register.vehicleRegister.findOne({user_email:email}); 
       if(!useremail){
            req.flash('message', "Invalid login details");
            return res.redirect('/login')
          }
       const isMatch = await bcryptjs.compare(password, useremail.password)
       if(!isMatch){
        req.flash('message', "Invalid login details");
         return res.redirect('/login')
       }
       var getUserId = useremail._id;
       var token = jwt.sign({userId:getUserId}, 'loginToken')
       localStorage.setItem('userToken', token)
       localStorage.setItem('loginUser', email)
        req.session.isAuth=true;
        req.flash('message',getUserId)
        res.redirect('/dashboard')
    }catch(error){
        req.flash('message', "Invalid login details");
        res.redirect('/login')
    } 
});

//=============== VEHICLE REGISTER SECTION START HERE =====================================


app.get("/vehicleregister", (req, res) => {
    res.render('vehicleregister',{message:req.flash('message')})
});

// VEHICLE REGISTERR
app.post("/vehicleregister", async(req, res) => {
    
    const {user_name,user_email,user_phone,vehicle_name,vehicle_model,vehicle_number,vehicle_color,vehicle_engine_cc,vehicle_fuel,vehicle_type,vehicle_registration_no,pincode,address,cpassword,password} = req.body;

    if(password != cpassword){  
             req.flash('message', "Password does not matched");
                return res.redirect('/vehicleregister');
            }

    let user = await Register.vehicleRegister.findOne({user_email});
        if(user){
          req.flash('message', "User Email Already Exist");
          return res.redirect('/vehicleregister')
        }

    let vehicle_num = await Register.vehicleRegister.findOne({vehicle_number});
    if(vehicle_num){
        req.flash('message', "Vehicle Number Exist");
       return res.redirect('/vehicleregister')
    }

    let vehicleregno = await Register.vehicleRegister.findOne({vehicle_registration_no});
    if(vehicleregno){
        req.flash('message', "Vehicle Registration Number Exist");
       return res.redirect('/vehicleregister')
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    vehicle = new Register.vehicleRegister({
        user_name,user_email,user_phone,vehicle_name,vehicle_model,vehicle_number,vehicle_color,vehicle_engine_cc,vehicle_fuel,
        vehicle_type,vehicle_registration_no,
        pincode,address,
        password:hashPassword
        
    })
    await vehicle.save();
    req.flash('message', "Vehicle Registertion Successfull....");
    res.redirect('/login');
});     
//=============== VEHICLE REGISTER SECTION END HERE =====================================





//========== USER REGISTERATION SECTION START HERE ==============
// app.get("/register", (req, res) => {
//     res.render("register", {message:req.flash('message')})
// });   

// // USER REGISTERATION
// app.post("/register", async(req, res) => {  
//     const {firstname,lastname,email,phone,gender,vehicle_number,address,pincode,password,cpassword} = req.body;
//     if(password != cpassword){  
//         req.flash('message', "Password does not matched");
//         return res.redirect('/register');
//     }
//     let user = await Register.userRegister.findOne({email});
//     if(user){
//         req.flash('message', "User Already Exist");
//        return res.redirect('/register')
//     }
//     const hashPassword = await bcryptjs.hash(password, 10);
//     user = new Register.userRegister({
//         _id:new mongoose.Types.ObjectId(),
//         firstname,lastname,email,gender,phone,vehicle_number,address,pincode,password:hashPassword
//     })
//     await user.save();
//     req.flash('message', "Signup Successfull ! Register Your Vehicle Now");
//     res.redirect('/vehicleregister');
// }); 
  
//======== USER DASHBOARD ============
app.get("/dashboard", isAuth, async(req, res) => {
    var loginUser = localStorage.getItem('loginUser');
       let userdata = await Register.vehicleRegister.findOne({user_email:loginUser}).exec();
       let mechdata = await Register.mechanicRegister.find({}).exec();
       let reqserv = await Register.requestService.find({}).exec();
       
     res.render("dashboard",{data:userdata,mecdata:mechdata,reqdata:reqserv})
   
});


app.get("/dashboard/request/:id", async(req, res) => {
    let reqId = req.params.id;
    var mechanicdata = await Register.mechanicRegister.findOne({_id:reqId}).exec();
    var mechanicId = mechanicdata._id;
    var mecmail = mechanicdata.mechanic_email;
    var mtoken = jwt.sign({mecId:mechanicId}, 'mechanicToken');
    localStorage.setItem('mecToken', mtoken)
    localStorage.setItem('mechanicEmail',mecmail)
    var loginUser = localStorage.getItem('loginUser')
    let userdata = await Register.vehicleRegister.findOne({user_email:loginUser}).exec();
    let mechdata = await Register.mechanicRegister.findOne({_id:reqId}).exec();
    res.render("requestservice",{data:userdata,mecdata:mechdata})

});

app.post("/requestservice", async(req, res, next) => {
    var loginUser = localStorage.getItem('loginUser');
    var mechmail = localStorage.getItem('mechanicEmail')

    var user_Data = await Register.vehicleRegister.findOne({user_email:loginUser}).exec();
    var mechanic_Data = await Register.mechanicRegister.findOne({mechanic_email:mechmail}).exec();

    var user_name = user_Data.user_name;
    var user_email = user_Data.user_email;
    var user_phone = user_Data.user_phone;
    var vehicle_name = user_Data.vehicle_name;
    var vehicle_number = user_Data.vehicle_number;
    var vehicle_registration_no = user_Data.vehicle_registration_no;

    var mechanic_name = mechanic_Data.mechanic_name;
    var mechanic_phone = mechanic_Data.mechanic_phone;
    var mechanic_email = mechanic_Data.mechanic_email;
    var mechanic_address = mechanic_Data.mechanic_address;
    var mechanic_speciality = mechanic_Data.mechanic_speciality;
    var mechanic_year_experiences = mechanic_Data.mechanic_year_experiences;
    var mechanic_services_charge = mechanic_Data.mechanic_services_charge;
    var repairecenter_name = mechanic_Data.repairecenter_name;

    var {location,problem,status} = req.body;

    // console.log(user_name,user_email,user_phone,vehicle_name,vehicle_number,vehicle_registration_no,mechanic_name,mechanic_phone,mechanic_email,mechanic_address,mechanic_speciality,mechanic_year_experiences,mechanic_year_experiences,mechanic_services_charge,repairecenter_name,location,problem)

    

    requestServ = new Register.requestService({
        user_name,user_email,user_phone,vehicle_name,
        vehicle_number,vehicle_registration_no,
        mechanic_name,mechanic_phone,mechanic_email,
        mechanic_address,mechanic_speciality,
        mechanic_year_experiences,mechanic_year_experiences,
        mechanic_services_charge,repairecenter_name,
        location,problem,status
            
    })
    await requestServ.save();
    res.redirect('/dashboard');
})


//======================== USER/CLIENT SECTION END HERE =================================







//============================ ADMIN SECTION START HERE =================================
app.get("/adminlogin", (req, res) => {
    res.render('adminlogin',{message:req.flash('message')})
});

// ADMIN LOGIN
app.post("/adminlogin", async(req, res) => {
    try{
        const email =req.body.email;
        const password =req.body.password; 
        const admindata = await Register.adminLogin.findOne({}).exec();
        const adminemail = admindata.admin_email;
        const adminpassword = admindata.password;
       if(email!=adminemail){
        req.flash('message', 'Invalid login details')
            return res.redirect('/adminlogin')
          };
       if(password!=adminpassword){
        req.flash('message', 'Invalid login details')
         return res.redirect('/adminlogin')
       };
        req.session.isAuth=true;
         return res.redirect('/admindashboard');
    }catch(error){
        req.flash('message', 'Invalid login details');
        res.redirect('/adminlogin');
    }
});

// ADMIN DASHBORAD
app.get("/admindashboard", isAuth, async(req,  res) => {
    const totaluser = await Register.vehicleRegister.count();
    const totalmechanic = await Register.mechanicRegister.count();
    const totalreqpend = await Register.requestService.count({status:"pending"});
    const totalreqcomplet = await Register.requestService.count({status:"completed"});
    
    res.render('admindashboard',{toutalUser:totaluser,totalmechanic:totalmechanic,totalreqpend:totalreqpend,totalreqcomp:totalreqcomplet})
});


app.get("/totalusers", async(req, res) => {
    const userDetails = await Register.vehicleRegister.find({});
    res.render("totalusers",{userdata:userDetails})
})
      
app.get("/totalmechanics", async(req, res) => {
    const mechanicDetails = await Register.mechanicRegister.find({});
    res.render("totalmechanics",{mecdata:mechanicDetails})
})

//addmechanics by admin
app.get("/addmechanics",(req, res) =>{
    res.render('addmechanics',{message:req.flash('message')})
})

app.post("/addmechanics", async(req, res) =>{
    const {repairecenter_name, mechanic_name, mechanic_email, mechanic_phone, mechanic_year_experiences, mechanic_services_charge, mechanic_address, mechanic_speciality, password,cpassword}  = req.body;

    console.log(repairecenter_name, mechanic_name, mechanic_email, mechanic_phone, mechanic_year_experiences, mechanic_services_charge, mechanic_address, mechanic_speciality, password,cpassword);

    //res.render("addmechanics")


    if(password != cpassword){
        req.flash('message',"Password does not match..!")
        return res.redirect("/addmechanics")
    }
    const mechanicEmail = await Register.mechanicRegister.findOne({mechanic_email})
    if(mechanicEmail){
        req.flash('message', "Mechanic Emai Already Exist...!")
        return res.redirect("/addmechanics")
    }
    const mecphone = await Register.mechanicRegister.findOne({mechanic_phone})
    if(mecphone){
        req.flash('message',"Mechanic Phone Already Exist...!")
        return res.redirect("/addmechanics")
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    mechanic = new Register.mechanicRegister({
        repairecenter_name, mechanic_name,mechanic_email, 
        mechanic_phone,mechanic_year_experiences,
        mechanic_services_charge,mechanic_address,
        mechanic_speciality,
        password:hashPassword,
    })  

    await mechanic.save();
    // req.flash('message',"Mechanic Registration Successfull...! Now Login with credentials")
    res.redirect("/totalmechanics")
 
})

app.get("/requests", async(req, res) => {
    const serReqPend = await Register.requestService.find({status:"pending"});
    res.render("requests",{reqpend:serReqPend})
})

app.get("/servicesprovided", async(req, res) => {
    const serReqCopm = await Register.requestService.find({status:"completed"});
    res.render("servicesprovided",{reqcomp:serReqCopm})
})




app.get("/admindashboard/delete/:id",isAuth ,async(req, res, next) => {
    const mechId = req.params.id;
    const mechancidelete = await Register.mechanicRegister.findByIdAndDelete({_id:mechId});
    if(mechancidelete){
        res.redirect('/totalmechanics')
    }  
})
// =================ADMIN SECTION END HERE =============================================




     

  


// ================ REPAIRE CENTER/ MECHANIC SECTION START HERE ========================
app.get("/mechaniclogin", (req, res) => {
    res.render('mechaniclogin',{message:req.flash('message')})
});

//MECHANIC LOGIN
app.post("/mechaniclogin", async(req, res) => {
       
    try{

    const {email, password} =req.body;
    
    const mechanicEmail = await Register.mechanicRegister.findOne({mechanic_email:email})
   
    if(!mechanicEmail){
        req.flash('message',"Invalid mechanic Details")
        return res.redirect("/mechaniclogin")
    }
    
    const isMatch = await bcryptjs.compare(password, mechanicEmail.password)
    if(!isMatch){
        req.flash('message',"Invalid ismathc Details")
        return res.redirect("/mechaniclogin")
    }
    
    const getmecId = mechanicEmail._id;
    const mechToken = jwt.sign({'mechanicToken':getmecId}, 'mechanicLogin');
    localStorage.setItem('mechToken',mechToken);
    localStorage.setItem('mechanic_login',email)
    req.session.isAuth=true;
    // req.flash('message',getmecId)
    res.redirect('/mechanicdashboard')

    }catch(err){
        req.flash('message',"Invalid catch Details")
        res.redirect("/mechaniclogin")
}
  
});


app.get("/mechanicregister", (req, res) => {
    res.render("mechanicregister",{message:req.flash("message")})
});

//MECHANIC REGISTERATION
app.post("/mechanicregister", async(req, res) => {
     
    const {repairecenter_name, mechanic_name, mechanic_email, mechanic_phone, mechanic_year_experiences, mechanic_services_charge, mechanic_address, mechanic_speciality, password,cpassword} = req.body;

    if(password != cpassword){
        req.flash('message',"Password does not match..!")
        return res.redirect("/mechanicregister")
    }
    const mechanicEmail = await Register.mechanicRegister.findOne({mechanic_email})
    if(mechanicEmail){
        req.flash('message', "Mechanic Emai Already Exist...!")
        return res.redirect("mechanicregister")
    }
    const mecphone = await Register.mechanicRegister.findOne({mechanic_phone})
    if(mecphone){
        req.flash('message',"Mechanic Phone Already Exist...!")
        return res.redirect("mechanicregister")
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    mechanic = new Register.mechanicRegister({
        repairecenter_name, mechanic_name,mechanic_email, 
        mechanic_phone,mechanic_year_experiences,
        mechanic_services_charge,mechanic_address,
        mechanic_speciality,
        password:hashPassword,
    })  

    await mechanic.save();
    req.flash('message',"Mechanic Registration Successfull...! Now Login with credentials")
    res.redirect("/mechaniclogin")
})

//dashboard
app.get("/mechanicdashboard", isAuth, async(req, res) => {
    const mecId = localStorage.getItem("mechanic_login")
    const mechanicData = await Register.mechanicRegister.findOne({mechanic_email:mecId}).exec();
    
    const mecEmail = mechanicData.mechanic_email;
    
   // const mecReqServ = await Register.requestService.find({mechanic_email:mecEmail});
    
    const mecReqPending = await Register.requestService.find({mechanic_email:mecEmail,status:"pending"});
    
    const mecReqComplet = await Register.requestService.find({mechanic_email:mecEmail,status:"completed"});

   res.render('mechanicdashboard',{data:mechanicData,
    // reqdata:mecReqServ
    reqpend:mecReqPending,reqcomp:mecReqComplet});
})


app.get("/mechanicdashboard/updaterequest/:id",isAuth ,async(req, res, next) => {
        const reqId = req.params.id;
        const pendReq = await Register.requestService.findOne({_id:reqId});
        const usereMail = pendReq.user_email;
        const old_status = {user_email:usereMail};
        const new_status = {$set:{status:"completed"}}
        const result = await Register.requestService.updateOne(old_status,new_status);
        res.redirect("/mechanicdashboard")
})


// =======================  MECHANIC SECTION END HERE ========================

   


//=====================404 ERROR PAGE START HERE ===============================

app.get("/*", (req, res) => {
    res.render("404error",{errorMsg:"Oooppsss... Page Not Found"})
});

//=====================404 ERROR PAGE END HERE=============================================

//================================= Logout Section ========================================
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/')
    })
});



app.listen(PORT, () => {
    console.log(`This application is running on the port no ${PORT}`)
})


module.exports = {isAuth}