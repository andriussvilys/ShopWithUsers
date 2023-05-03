import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';
import {getContact} from './Contacts/Contacts.mjs'
import { getProducts } from './Products.mjs';

const router = express.Router();
const products = db.collection('products');

//req.body = data to be uploaded/downloaded
//req.query = query to fetch relevant resources
//req.params = options

router.get('/:id', async (req, res) => {


    try{

        const query = {_id: new ObjectId(req.params.id), ...req.params.query}

        const resBody = await getProducts(query)
        
        res.status(200).send( resBody )
    }
    catch(err){
        res.status(500).send({"error" : err.message})
    }

})

router.patch('/:id', async (req, res) => {

    try{

        const options = {}
        const query = {_id : new ObjectId(req.params.id), ...req.params.query}
    
        let updatedDoc = {};

        const updateRes = await products.updateOne(query, {$set : req.body}, options)
        
        if(updateRes.modifiedCount > 0){
            updatedDoc = await products.findOne({_id : new ObjectId(req.params.id)})
        }

        res.status(200).send( updatedDoc )

    }
    catch(err){
        res.status(500).send( { error: err.message } );
    }


})

router.put('/:id', async (req, res) => {

    try{

        
        const query = {_id : new ObjectId(req.params.id), ...req.params.query}
        const replaceRes = await products.replaceOne(query, req.body, {upsert: true})
        
        let updatedDoc = {}
        if(replaceRes.modifiedCount > 0 || replaceRes.upsertedCount > 0){
            updatedDoc = await products.findOne({_id : new ObjectId(req.params.id)})
        }

        res.status(200).send( updatedDoc )
    }
    
    catch(err){
        res.status(500).send({ "error" : err.message})
    }

})

router.delete('/:id', (req, res) => {

    const query = {_id: new ObjectId(req.params.id), ...req.params.query}
    
    products.deleteOne(query)
    .then( delete_res => {

        res.status(200).send( delete_res )
    })

    .catch( err => {
        res.status(500).send( { error: err.message } )
    })

})

export default router;