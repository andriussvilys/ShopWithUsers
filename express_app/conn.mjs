import { MongoClient } from "mongodb";

const url = 'mongodb://root:example@mongo:27017'
// const url = 'mongodb://root:example@localhost:27017'

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true } );

let conn;

try{
    conn = await client.connect({ useNewUrlParser: true });
}
catch (err){
    throw err
}

let db = conn.db('Shop');

export default db;
