const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require('mongodb').MongoClient;


const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmory.azure.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const serviceCollection = client.db(process.env.DB_NAME).collection("service");
	const orderCollection = client.db(process.env.DB_NAME).collection("order");
	const reviewCollection = client.db(process.env.DB_NAME).collection("review");
	console.log("DB connected 🚀");

	
	app.get("/home/services", (req, res) => {
		serviceCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

	app.get("/home/reviews", (req, res) => {
		reviewCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

	app.post("/addReview", (req, res) => {
		const newReview = req.body;
		reviewCollection.insertOne(newReview).then((result) => {
			console.log(result, "Added new review ✅");
		});
	});

	app.post("/addOrder", (req, res) => {
		const newOrder = req.body;
		orderCollection.insertOne(newOrder).then((result) => {
			console.log(result, "Added new order ✅");
			res.send(result.insertedCount > 0);
		});
	});

	app.get("/serviceList", (req, res) => {
		orderCollection.find({ email: req.query.email }).toArray((error, documents) => {
			res.send(documents);
			console.log(error);
		});
	});
});

app.get("/", (req, res) => {
	res.send("Hello from Express, API is working 👨🏻‍💻");
});

app.listen(process.env.PORT || port);