const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../db");


//Register API

router.post("/register", async (req, res) => {

    const { name, email, password, favorite_drink } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {

            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                return res.json({
                    message: "Email already exists"
                });
            }

            const hash = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users(name,email,password,favorite_drink) VALUES(?,?,?,?)",
                [name, email, hash, favorite_drink],
                (err) => {

                    if (err) return res.status(500).json(err);

                    res.json({
                        success: true,
                        message: "Registration Successful"
                    });

                }
            );

        }
    );

});



// Login API

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {

            if (err) return res.status(500).json(err);

            if (result.length == 0) {

                return res.json({
                    message: "User Not Found"
                });

            }

            const user = result[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if (!match) {

                return res.json({
                    message: "Incorrect Password"
                });

            }

            const token = jwt.sign(

                {
                    id: user.id,
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            );

            res.json({

                success: true,

                token,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    reward_points: user.reward_points

                }

            });

        }

    );

});







module.exports = router;