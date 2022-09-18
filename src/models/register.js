const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     firstname : {
//         type : String,
//         required :true
//     },
//     lastname : {
//         type : String,
//         required :true
//     },
//     email : {
//         type : String,
//         required :true,
//         unique :true
//     },
//     gender : {
//         type : String,
//         required :true
//     },
//     phone : {
//         type : String,
//         required :true,
//         unique :true
//     },
//     vehicle_number : {
//         type : String,
//         required :true
//     },
//     address : {
//         type:String,
//         required:true
//     },
//     pincode : {
//         type:Number,
//         required:true
//     },
//     password : {
//         type : String,
//         required :true
//     }
    
// });

const adminSchema = new mongoose.Schema({
    admin_email:{
        type:String,
        require:true   
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    }

})





const vehicleSechem = new mongoose.Schema({
    user_name:{
        type:String,
        required:true
    },
    user_email:{
        type:String,
        required:true,
        
    },
    user_phone:{
        type:String,
        required:true
    },
    vehicle_name:{
        type:String,
        required:true
    },
    vehicle_model:{
        type:String,
        required:true
    },
    vehicle_number:{
        type:String,
        required:true,
        
    },
    vehicle_color:{
        type:String,
        required:true

    },
    vehicle_engine_cc:{
        type:Number,
        required:true
    },
    vehicle_fuel:{
        type:String,
        required:true
    },
    vehicle_type:{
        type:String,
        required:true,
    },
    vehicle_registration_no:{
        type:String,
        required:true,
        unique:true
    },
    address: {
        type:String,
        required:true
    },
    pincode: {
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
    
});


const mechanicSchema = new mongoose.Schema({
    repairecenter_name:{
        type:String,
        required:true
    },
    mechanic_name:{
        type:String,
        required:true
    },
    mechanic_email:{
        type:String,
        required:true,
        unique:true
    },
    mechanic_phone:{
        type:Number,
        required:true,
    },
    mechanic_year_experiences:{
        type:Number,
        required:true
    },
    mechanic_services_charge:{
        type:Number,
        required:true
    },
    mechanic_address:{
        type:String,
        required:true
    },
    mechanic_speciality:{
        type:String,
        required:true
    },
    password:{  
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

const requestServiceSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required:true
    },
    user_email:{
        type:String,
        required:true,
    },
    user_phone:{
        type:String,
        required:true
    },
    vehicle_name:{
        type:String,
        required:true
    },
    vehicle_registration_no:{
        type:String,
        required:true,
    },
    vehicle_number:{
        type:String,
        required:true,
    },
    repairecenter_name:{
        type:String,
        required:true
    },
    mechanic_name:{
        type:String,
        required:true
    },
    mechanic_email:{
        type:String,
        required:true,
    },
    mechanic_phone:{
        type:Number,
        required:true,
    },
    mechanic_year_experiences:{
        type:Number,
        required:true
    },
    mechanic_services_charge:{
        type:Number,
        required:true
    },
    mechanic_address:{
        type:String,
        required:true
    },
    mechanic_speciality:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    problem:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
}); 


// const userRegister = new mongoose.model("UserRegister", userSchema);
const adminLogin = new mongoose.model("Admin",adminSchema);
const vehicleRegister = new mongoose.model("VehicleRegister", vehicleSechem);
const mechanicRegister = new mongoose.model("MechanicRegister", mechanicSchema);
const requestService = new mongoose.model("RequestService",requestServiceSchema)
  
module.exports ={adminLogin,vehicleRegister,mechanicRegister,requestService};