// mongo-init/init.js
// This runs once when the MongoDB container is first created (empty data volume).
// The API also ensures these indexes on every startup (see MongoContext.EnsureIndexesAsync),
// so an existing volume isn't left without them.

// NOTE: must match the database the API connects to (MongoContext -> 'vuur_mongo').
db = db.getSiblingDB('vuur_mongo');

db.createCollection('products');

// Search.
db.products.createIndex({ ProductName: 'text', ProductDescription: 'text' });

// Cursor-pagination sort keys (each carries _id as the unique tiebreaker).
db.products.createIndex({ CreatedAt: -1, _id: -1 });
db.products.createIndex({ MinPrice: 1, _id: 1 });
db.products.createIndex({ Rating: -1, _id: -1 });
db.products.createIndex({ ProductName: 1, _id: 1 });

// Filters.
db.products.createIndex({ Genre: 1 });
db.products.createIndex({ 'Variants.Platform': 1, 'Variants.Format': 1 }); // multikey
db.products.createIndex({ Flags: 1 });                                     // multikey

db.createCollection('productCache');
db.productCache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

print('MongoDB initialized for Vuur.');
