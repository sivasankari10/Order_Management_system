const express = require('express');
const Redis = require('ioredis');
const router = express.Router();
const redis = new Redis();
router.post('/', (req, res) => {
    const { clientId, clientData } = req.body;
    if (!clientId || !clientData) {
        return res.status(400).json({ error: 'Both clientId and clientData are required' });
    }
    const fieldValues = Object.entries(clientData).flat();
    const key =' client:${clientId}';
    redis.hmset(key, fieldValues, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Client added successfully', result });
    });
});
router.get('/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const key = 'client:${clientId}';
    redis.hgetall(key, (err, clientData) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!clientData) {
            return res.status(404).json({ error: 'Client data not found' });
        }
        res.json(clientData);
    });
});
router.delete('/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const key = 'client:${clientId}';
    redis.del(key, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result === 0) {
            return res.status(404).json({ error: 'Client data not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully', result });
    });
});
router.put('/:clientId/:field', (req, res) => {
    const clientId = req.params.clientId;
    const field = req.params.field;
    const value = req.body.value;
    if (!value) {
        return res.status(400).json({ error: 'Value is required to update the field' });
    }
    const key = 'client:${clientId}';
    redis.hset(key, field, value, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result === 0) {
            return res.status(404).json({ error: 'Field not found' });
        }
        res.status(200).json({ message: 'Field updated successfully', result });
    });
});
router.get('/', (req, res) => {
    redis.keys('client:*', (err, keys) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!keys || keys.length === 0) {
            return res.status(404).json({ error: 'No records found' });
        }

        const getAllDataPromises = keys.map(key => {
            return new Promise((resolve, reject) => {
                redis.hgetall(key, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });

        Promise.all(getAllDataPromises)
            .then(results => {
                res.json(results);
            })
            .catch(err => {
                console.error('Redis error:', err);
                res.status(500).json({ error: 'Internal server error' });
            });
    });
});
module.exports = router;