const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const mysql = require('mysql2');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

