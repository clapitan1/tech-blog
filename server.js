const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const mysql = require('mysql2');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');
const { urlencoded } = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize,
    }),
};

app.use(session(sessionOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

