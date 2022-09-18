const mongoose = require('mongoose');
const MongoUri = "mongodb://localhost:27017/ORVRS"
const connection = mongoose.connect(MongoUri)
.then( () =>{
    console.log("Connection Successfull...")
}).catch((err) => {
    console.log(err)
})

module.exports ={MongoUri,connection}