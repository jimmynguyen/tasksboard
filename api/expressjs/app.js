const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors());

const setup_boards_routes = require('./routes/boards');
const setup_lists_routes = require('./routes/lists');
const setup_tasks_routes = require('./routes/tasks');

const {EntityManager} = require('./entityManager');
const em = new EntityManager('../../db/json/db.json');

console.log('setup routes');
setup_boards_routes(app,em);
setup_lists_routes(app,em);
setup_tasks_routes(app,em);

console.log('listening on port 3000');
app.listen(3000);