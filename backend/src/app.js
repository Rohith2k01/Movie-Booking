require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const adminRoutes = require('./routes/admin/adminroutes');
const userRoutes= require('./routes/user/userroutes');
const passport = require('passport');  
const authRoutes = require('./routes/authroutes'); // Add auth routes
const jwt = require('jsonwebtoken');

const session = require('express-session');
const { db } = require('./config/db')
require('./config/passport');  // Add the passport configuration

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust this to your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true                 // Allow cookies
}));



app.use('/uploads', express.static('uploads'));


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true },
  
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes


app.use('/api/admin/', adminRoutes); // Add the new movie routes
app.use('/api/', userRoutes); // Add the new movie routes
app.use('/api/auth/', authRoutes);  

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
