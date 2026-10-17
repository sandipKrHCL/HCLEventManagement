const express = require('express');
const app = express();
const port = 8081;
app.use(express.json()); 
const eventController = require('./controller/EventControler');
const registerController = require('./controller/RegisterController');

app.use('/event', eventController);
app.use('/register', registerController);

//Global Error-handling middleware
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send('Internal server error!');
})
app.listen(port);