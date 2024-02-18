
const mongoose= require('mongoose');

function connectDB(){
    mongoose.connect    ('mongodb+srv://anasbrototype:anas4470@cluster0.fmaqiqe.mongodb.net/?retryWrites=true&w=majority')
        .then(()=>{
            console.log('Connected to MongoDB');
        })
        .catch((error)=>{
            console.error('Error connecting to MongoDB:', error.message);
        });
} 

module.exports= (connectDB); 