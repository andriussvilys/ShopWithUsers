import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';

const router = express.Router();
const products = db.collection('products');

//req.body = data to be uploaded/downloaded
//req.query = query to fetch relevant resources
//req.params = options

router.get('/:id', async (req, res) => {

    console.log("GET ONE")

    const query = {_id: new ObjectId(req.params.id), ...req.params.query}
    console.log(query)

    products.findOne(query, {})
    .then( value => {
        res.status(200).send( {data : {...value}} )
    })

    .catch((err) => {
        res.status(500).send(  { error: err.message });
    })

})

router.patch('/:id', (req, res) => {

    const options = {}
    const query = {_id : new ObjectId(req.params.id), ...req.params.query}
    console.log(query)

    products.updateOne(query, {$set : req.body}, options)
    .then( value => {
        res.status(200).send( { data: {...value} } )
    }) 

    .catch(err => {
        res.status(500).send( { error: err.message } );
    })

})

router.put('/:id', (req, res) => {

    const query = {_id : new ObjectId(req.params.id), ...req.params.query}
    console.log(query)

    products.replaceOne(query, req.body, {upsert: true})
    .then( value => {

        res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })
    
})

router.delete('/:id', (req, res) => {

    const query = {_id: new ObjectId(req.params.id), ...req.params.query}
    
    products.deleteOne(query)
    .then( value => {

        res.status(200).send( { data: {...value} } )
    })

    .catch( err => {
        res.status(500).send( { error: err.message } )
    })

})

export default router;