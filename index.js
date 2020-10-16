const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello World! This is a Creative Agency')
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmory.azure.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    const OrdersCollection = client.db(process.env.DB_NAME).collection('service');
    const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    console.log('Database connected');

    app.post('/newReview', (req, res) => {
        reviewsCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    //get all clients review form database
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, data) => {
                res.send(data);
            })
    });

    //new order info save in database
    app.post('/orders', (req, res) => {
        OrdersCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    //get all orders/services form database
    app.get('/service', (req, res) => {
        OrdersCollection.find({})
            .toArray((err, data) => {
                res.send(data);
            })
    });

    //admin email post in database
    app.post('/makeAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    //get services for specific single user
    app.get('/Service', (req, res) => {
        // console.log(req.query.email);
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const tokenEmail = bearer.split(' ')[1];
            if (tokenEmail === req.query.email) {
                OrdersCollection.find({ email: req.query.email })
                    .toArray((err, data) => {
                        res.send(data);
                    })
            } else {
                res.send('Unauthorized Access');
            }
        } else {
            res.send('Unauthorized Access');
        }
    });

    //see admin panel when login a admin
    app.post('/adminUser', (req, res) => {
        adminCollection.find({ email: req.body.email })
            .toArray((err, data) => {
                res.send(data.length > 0)
            })
    })




    // client.close();
});


app.listen(process.env.PORT || 5000);
    