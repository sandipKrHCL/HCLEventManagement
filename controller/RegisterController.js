const express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'apply-event.json');
const userPath = path.join(__dirname, 'users.json');

router.post('/apply', function (req, res) {

    const { eventId, userId, eventName } = req.body;

    if (!eventId || !userId) {
    return res.status(400).json({ error: 'event id, and user id are required.' });
    }

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

    fs.readFile(userPath, 'utf8', (eventErr, eventData) => {
        if (eventErr) {
            if (eventErr.code === 'ENOENT') {
                return res.status(404).json({ error: 'Event not found.' });
            }
            return res.status(500).json({ error: 'Error reading event storage file.' });
        }

        let events;
        try {
            events = eventData.trim() ? JSON.parse(eventData) : [];
            if (!Array.isArray(events)) {
                return res.status(500).json({ error: 'Internal data formatting error.' });
            }
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return res.status(500).json({ error: 'Internal data formatting error.' });
        }

        const selectedEvent = events.find(event => String(event.id) === String(eventId));
        if (!selectedEvent) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        if (selectedEvent.capacity !== undefined && selectedEvent.capacity !== null) {
            const capacity = Number(selectedEvent.capacity);
            if (!Number.isFinite(capacity) || capacity < 0) {
                return res.status(500).json({ error: 'Invalid event capacity.' });
            }

            const applicationCount = items.filter(item => String(item.eventId) === String(eventId)).length;
            if (applicationCount >= capacity) {
                return res.status(400).json({ error: 'Event capacity has been reached.' });
            }
        }

        const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newItem = {
            id: maxId + 1,
            eventId,
            userId,
            eventName
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
});



router.delete('/cancel', (req, res) => { 
    const { id } = req.body; 
    if (!id) { 
        return res.status(400).json({ error: 'id is required to delete a event.' }); 
    } 

    fs.readFile(filePath, 'utf8', (err, data) => { 
        if (err) return res.status(500).json({ error: 'Error reading storage file.' }); 
        
        try { 
            let event = data.trim() ? JSON.parse(data) : []; 
            const userExists = event.some(u => u.id === id); 
            
            if (!userExists) { 
                return res.status(404).json({ error: 'Event not found.' }); 
            } 

            const updatedEvent = event.filter(u => u.id !== id); 

            fs.writeFile(filePath, JSON.stringify(updatedEvent, null, 2), (writeErr) => { 
                if (writeErr) return res.status(500).json({ error: 'Error deleting user data.' }); 
                return res.status(200).json({ message: 'event deleted successfully.' }); 
            }); 
        } catch (parseError) { 
            return res.status(500).json({ error: 'Internal data formatting error.' }); 
        } 
    }); 
});

router.get('/user-events/:userId', function (req, res) {
    const { userId } = req.params;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(200).json([]); 
            } else {
                return res.status(500).json({ error: 'Error reading storage file.' });
            }
        }

        try {
            const trimmedData = data.trim();
            const items = trimmedData ? JSON.parse(trimmedData) : [];

            if (!Array.isArray(items)) {
                return res.status(200).json([]);
            }

            const userEvents = items.filter(item => String(item.userId) === String(userId));
            return res.status(200).json(userEvents);

        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return res.status(500).json({ error: 'Internal data formatting error.' });
        }
    });

});

module.exports = router;
