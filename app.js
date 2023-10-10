require('dotenv').config();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const routes = require('./routes/index');

const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./utils/rate-limit');

const {
  PORT = 3000,
  DATABASE_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

const app = express();

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(`Ошибка: ${err}`);
  });

app.use(requestLogger);

app.use(cors());

app.use(helmet());

app.use(routes);

app.use(express.static(path.join(__dirname, 'public')));

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
