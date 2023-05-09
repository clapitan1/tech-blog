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

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3001,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySql database');
});

class User extends Model {}

User.init(
    {
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'user',
    }
);

class Post extends Model {}

Post.init(
    {
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        contents: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'post',
    }
);

User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

app.get('/', (req, res) => {
    Post.findAll({
        include: User,
        order: [['createdAt', 'DESC']],
    })
        .then((posts) => {
            res.render('homepage', { posts });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/login', (req, res) => {
    res.render('/login');
});

app.post('/login', (req, res) => {
    const {username, password } = req.body;

    User.findOne({ where: { username } })
    .then((user) => {
        if (!user) {
            res.status(400).send('Invalid username or password');
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err || !result) {
                    res.status(400).send('Invalid username or password');
                } else {
                    req.session.user = user;
                    res.redirect('/');
                }
            });
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});

app.get('/logout' (req, res => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            res.redirect('/');
        }
    });
}));

app.listen(PORT, () => {
    console.log('Server listening on port ${PORT}');
});