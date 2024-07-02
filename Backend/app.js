const express = require('express');
const app = express();
const cors = require('cors');
const { QueryTypes } = require('sequelize');
const { sequelize, users } = require('./Model/Index');
const bcrypt = require('bcrypt')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(401).json({ error: "Please fill all the fields!" });
        }

        // Regular expression for basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "This is not an correct email form" });
        }

        const checkEmail = await users.findAll({
            where: {
                Email: email
            }
        });

        if (checkEmail.length > 0) {
            console.log("email already exists");
            return res.status(400).send("The Email you entered already exists");
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        await sequelize.query('INSERT INTO users (UserName,Email,Password) VALUES (?, ?, ?)', {
            type: QueryTypes.INSERT,
            replacements: [username, email, hashedPassword]
        });

        res.status(200).json("Success");
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) { 
        return res.status(400).json({ error: "fill input" }); 
    }

    const user = await users.findOne({
        where: {
            Email: email
        }
    });

    if (!user) {
        return res.status(401).json({ error: "User does not exist." });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.Password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Incorrect password." });
    }
    return res.status(200).json({ message: "Login successful." });
});



app.listen(3000, () => {
    console.log("The server is running");
});
