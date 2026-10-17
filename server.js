const express = require('express');
const app = express();
const port = 8081;
app.use(express.json()); 
const eventController = require('./controller/EventControler');

app.use('/event', eventController);

//Global Error-handling middleware
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send('Internal server error!');
})
app.listen(port);