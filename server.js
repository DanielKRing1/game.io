// npm install express socket.io nodemon

const express = require('express');
const app = express();
const server = require('http').Server(app);
const sockets = require('./sockets');
const path = require('path');

const port = process.env.PORT || 3000;

app.use('/static', express.static(`${__dirname}/static`));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));
sockets.init(server);