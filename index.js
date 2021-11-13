const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gtc9s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        client.connect();
        console.log('database connected successfully')

        const database = client.db("aneesaSunglasses");
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users')
        const ordersCollection = database.collection('orders')
        const reviewsCollection = database.collection("reviews")

        // get all products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray();
            res.send(products)
        });


        // get single product API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);

        });

        // product post to DB
        app.post('/products', async (req, res) => {
            const order = req.body;
            const result = await productsCollection.insertOne(order);
            res.json(result);
        });


        // post user to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        });
        // post user to DB ends

        // assign as admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);


        });

        // 

        // verify admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            let isAdmin = false;
            const user = await usersCollection.findOne(query);
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        });

        // order post to DB
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });


        // get all orders API
        app.get('/orders/all', async (req, res) => {
            const cursor = ordersCollection.find({})
            const order = await cursor.toArray();
            res.send(order);
        });


        // update status

        app.put('/orders/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: { Status: 'Shipped' } }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })



        // get one user's orders from DB
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // delete order

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })



        // delete products

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result)
        })

        // post Review to DB
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);

        })

        // get reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const review = await cursor.toArray();
            res.send(review);
        })

    }
    finally {
        // client.close() 
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Server Running Properly')
});

app.listen(port, () => {
    console.log('server running on port: ', port);
})
