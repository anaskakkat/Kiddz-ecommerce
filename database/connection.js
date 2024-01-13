
const mongoose= require('mongoose');

function connectDB(){
    mongoose.connect    ('mongodb://127.0.0.1:27017/EcomFashion')
        .then(()=>{
            console.log('Connected to MongoDB');
        })
        .catch((error)=>{
            console.error('Error connecting to MongoDB:', error.message);
        });
} 

module.exports= (connectDB); 