const express = require('express');
const app = express();
const validator = require('validator');
const mongoose = require('mongoose');
const {Schema} = require('mongoose')


const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,          
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

async function main() {
  await mongoose.connect('mongodb+srv://mrthakur30:mukul@cluster0.bcibswz.mongodb.net/myapp',{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('Error connecting to MongoDB:', err)); 
}

main();


const userSchema = new Schema({
    name: { type: String, required: true, unique: false },
    email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

const PORT = process.env.PORT || 3001 ;

app.use(express.json());

app.post('/api/save', async function (req, res){
    console.log(req.body);
    const {name, email} = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const isValidEmail = validator.isEmail(email);

    if (isValidEmail) {
        try {
            const newUser = new User({ name, email });
            await newUser.save();
            return res.json({ message: 'User registered successfully!' });
    
          } catch (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ error: 'An error occurred while registering the user.' });
          }
    } else {
      return res.json({ isValid: false , error: "invalid email address" });
    }

});


app.listen(PORT,()=>{
    console.log('listening on port',PORT);
})