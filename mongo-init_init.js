// mongo-init/init.js
// This runs once when the MongoDB container is first created.
// Add initial collections and indexes here.

db = db.getSiblingDB('vuur_db');

db.createCollection('products');
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });

db.createCollection('productCache');
db.productCache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

print('MongoDB initialized for Vuur.');
