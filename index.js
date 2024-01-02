// Importing required modules
var express = require('express');
var ejs = require('ejs');
const mysql = require('mysql');
var bodyParser = require('body-parser');
const DatabaseSql = require("./DatabaseSql");

// Create Express application
var app = express();

// Create a connection pool to handle MySQL connections
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023',
});

// Set view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Configure middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
    // Release the connection back to the pool
    connection.release();
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

// Middleware to log server accesses
app.use((req, res, next) => {
    res.counter = ++counter;
    console.log('Server accessed: ' + res.counter);
    next();
});

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Middleware for handling 404 errors
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// logs request details
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`Request Method: ${req.method}`);
    next();
});

// showing details of all stores
app.get('/stores', async (req, res) => {
    try {
        const storeData = await DatabaseSql.getStores(pool);
        let html = '<link rel="stylesheet" type="text/css" href="../css/index.css"/><h1>Stores</h1><br/><a href="/addstore">Add Store</a><table border="1px" cellspacing="0">';
        html = html + '<tr><th>SID</th> <th>Location</th> <th>Manager ID</th> <th>Action</th></tr>';

        for (const row of storeData) {
            html = html + `<tr> <td>${row["sid"]}</td> <td>${row["location"]}</td> <td>${row["mgrid"]}</td> <td><a href="/stores/edit/${row['sid']}">Update</a></td></tr>`;
        }

        html = html + '</table><br/><a href="/">Home</a>';
        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

// showing details of all products
app.get('/products', async (req, res) => {
    try {
        const productData = await DatabaseSql.getProducts(pool);
        let html = '<link rel="stylesheet" type="text/css" href="../css/index.css"/><h1>Products</h1><br/><table border="1px" cellspacing="0">';
        html = html + '<tr><th>Product ID</th> <th>Description</th> <th>Store ID</th> <th>Location</th> <th>Price</th> </th></tr>';

        for (const row of productData) {
            html = html + `<tr> <td>${row["pid"]}</td> <td>${row["productdesc"]}</td> <td>${row["sid"]}</td> <td>${row["location"]}</td> <td>${row["Price"]}</td> <td><a href="/products/delete/${row["pid"]}">Delete ${row["productdesc"]}</a></td></tr>`;
        }

        html = html + '</table><br/><a href="/">Home</a>';
        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

// editing a store
app.get("/stores/edit/:sid", async (req, res) => {
    try {
        const sid = req.params['sid'];
        const storeData = await DatabaseSql.getStoreById(pool, sid);

        if (storeData.length > 0) {
            const mgrid = storeData[0]['mgrid'];
            const location = storeData[0]['location'];
            var path = __dirname + '/views/store-edit.ejs';
            res.render(path, { errors: ['one', 'two'] });
        } else {
            res.status(404).send('Store not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

// adding a store
app.get("/addstore", (req, res) => {
    var path = __dirname + '/views/add-store.ejs';
    res.render(path, { errors: [] });
});

// handling store edits (POST request)
app.post("/editstore", async (req, res) => {
    try {
        const result = await DatabaseSql.editStore(pool, req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

// deleting a product
app.get("/products/delete/:pid", async (req, res) => {
    try {
        const pid = req.params['pid'];
        await DatabaseSql.deleteProduct(pool, pid);
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});
