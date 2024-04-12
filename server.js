const express = require('express');
const bodyParser = require('body-parser');
const clientInfoApi = require('./clientInfoApi');
const app = express();
app.use(bodyParser.json());
app.use('/api/client', clientInfoApi);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port ${PORT}");
});