const express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'users.json');


router.post('/create', function (req, res) {
  const { name, discription, start_date, end_date, location, status, createdBy, category, contect } = req.body;

  if (!name || !discription || !location || !status) {
    return res.status(400).json({ error: 'Name, description, location, and status are required.' });
  }

  // 2. Read existing data
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        data = '[]';
      } else {
        return res.status(500).json({ error: 'Error reading storage file.' });
      }
    }

    let items = [];
    try {
      const trimmedData = data.trim();
      items = trimmedData ? JSON.parse(trimmedData) : [];
      if (!Array.isArray(items)) {
        items = [];
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({ error: 'Internal data formatting error.' });
    }

    const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newId = maxId + 1;

    const newItem = {
      id: newId,
      name,
      discription,
      start_date,
      end_date,
      status,
      location,
      createdBy,
      category,
      contect
    };

    items.push(newItem);

    fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Error saving data to storage.' });
      }
      return res.status(201).json(newItem);
    });
  });
});


router.get('/fetch', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.status(200).json([]); 
      return res.status(500).json({ error: 'Error reading storage file.' });
    }
    try {
      const users = data.trim() ? JSON.parse(data) : [];
      return res.status(200).json(users);
    } catch (parseError) {
      return res.status(500).json({ error: 'Internal data formatting error.' });
    }
  });
});


router.put('/update', (req, res) => {
   const { id, name, discription, start_date, end_date, location, status, createdBy, category, contect } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Target id is required to update a user.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading storage file.' });

    try {
      let users = data.trim() ? JSON.parse(data) : [];
      
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      users[userIndex].name = name || users[userIndex].name;
      users[userIndex].discription = discription || users[userIndex].discription;
      users[userIndex].start_date = start_date || users[userIndex].start_date;
      users[userIndex].end_date = end_date || users[userIndex].end_date;
      users[userIndex].location = location || users[userIndex].location;
      users[userIndex].status = status || users[userIndex].status;
      users[userIndex].createdBy = createdBy || users[userIndex].createdBy;
      users[userIndex].category = category || users[userIndex].category;
      users[userIndex].contect = contect || users[userIndex].contect;

      fs.writeFile(filePath, JSON.stringify(users, null, 2), (writeErr) => {
        if (writeErr) return res.status(500).json({ error: 'Error updating user data.' });
        return res.status(200).json({ message: 'User updated successfully.', user: users[userIndex] });
      });

    } catch (parseError) {
      return res.status(500).json({ error: 'Internal data formatting error.' });
    }
  });
});

router.delete('/delete', (req, res) => { 
    const { id } = req.body; 
    if (!id) { 
        return res.status(400).json({ error: 'id is required to delete a user.' }); 
    } 

    fs.readFile(filePath, 'utf8', (err, data) => { 
        if (err) return res.status(500).json({ error: 'Error reading storage file.' }); 
        
        try { 
            let users = data.trim() ? JSON.parse(data) :[]; 
            const userExists = users.some(u => u.id === id); 
            
            if (!userExists) { 
                return res.status(404).json({ error: 'Event not found.' }); 
            } 

            const updatedUsers = users.filter(u => u.id !== id); 

            fs.writeFile(filePath, JSON.stringify(updatedUsers, null, 2), (writeErr) => { 
                if (writeErr) return res.status(500).json({ error: 'Error deleting user data.' }); 
                return res.status(200).json({ message: 'User deleted successfully.' }); 
            }); 
        } catch (parseError) { 
            return res.status(500).json({ error: 'Internal data formatting error.' }); 
        } 
    }); 
});


module.exports = router;