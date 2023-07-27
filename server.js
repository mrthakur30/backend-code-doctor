const express = require('express');
const app = express();
const validator = require('validator');
const mongoose = require('mongoose');
const { Schema } = require('mongoose')


const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

async function main() {
  await mongoose.connect('mongodb+srv://mrthakur30:mukul@cluster0.bcibswz.mongodb.net/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
}

main();


const userSchema = new Schema({
  name: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/save', async function (req, res) {
  console.log(req.body);
  const { name, email } = req.body;

  const isValidEmail = validator.isEmail(email);

  if (isValidEmail) {
    try {
      const newUser = new User({ name, email });
      await newUser.save();
      return res.json({ message: 'User registered successfully!' });

    } catch (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ message: 'An error occurred while registering the user.' });
    }
  } else {
    return res.json({ isValid: false, message: "invalid email address" });
  }

});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const nameQuery = { name: { $regex: query, $options: 'i' } };
    const emailQuery = { email: { $regex: query, $options: 'i' } };
    const searchQuery = { $or: [nameQuery, emailQuery] };

    const users = await User.find(searchQuery);

    res.json(users);
  } catch (err) {
    console.error('Error executing search:', err);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
})


app.get('/api/data', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error executing search:', err);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
})


app.delete('/api/delete', async (req, res) => {
   const {email} = req.body ;
   try{
    if (!email) {
      return res.status(400).json({ message: 'Email is required for deletion.' });
    }
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found for deletion.' });
    }

    res.json({ message: 'User deleted successfully!', deletedUser });
   }catch(err){
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting'});
   }
})

app.listen(PORT, () => {
  console.log('listening on port', PORT);
})