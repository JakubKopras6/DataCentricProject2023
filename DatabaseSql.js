const mysql = require('mysql');

// Function to get details of all stores
function getStores(pool) {
    return new Promise((resolve, reject) => {
        pool.query('select * from store', (err, rows, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Function to get details of all products
function getProducts(pool) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT p.pid, p.productdesc, s.sid, s.location, sct.Price FROM product p LEFT JOIN product_store sct ON p.pid = sct.pid LEFT JOIN store s ON sct.sid = s.sid;', (err, rows, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Function to get details of a store by ID
function getStoreById(pool, sid) {
    return new Promise((resolve, reject) => {
        const query = 'select * from store where sid ="' + sid + '"';
        pool.query(query, (err, rows, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Function to edit store details
function editStore(pool, body) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE store SET
            location = '${body.location}',
            mgrid = '${body.mgrid}'
            WHERE sid LIKE(\"${body.sid}\")`;
        pool.query(query, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Function to delete a product
function deleteProduct(pool, pid) {
    return new Promise((resolve, reject) => {
        const query = 'select * from product_store where pid ="' + pid + '"';
        pool.query(query, (err, rows, fields) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length == 0) {
                    // If the product is not associated with any store, delete it
                    const deleteQuery = 'delete from product where pid ="' + pid + '"';
                    pool.query(deleteQuery, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                } else {
                    // If the product is associated with a store, reject with an error message
                    reject(new Error(`${pid} is currently in stores and cannot be deleted`));
                }
            }
        });
    });
}

module.exports = {
    getStores,
    getProducts,
    getStoreById,
    editStore,
    deleteProduct
};
