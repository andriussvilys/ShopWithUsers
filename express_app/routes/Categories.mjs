import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';
import {getCategoryById} from './ProductsByCategory.mjs'

const router = express.Router();
const categories = db.collection('categories');
const products = db.collection('products');

//req.body = data to be uploaded/downloaded
//req.params.query = query to fetch relevant resources
//req.params.[named param] eg resources/:id -- id is the named param

// 2XX — Success
    // 201 — Created
    // 202 — Accepted
    // 204 — No Content
// 3XX — Redirection
// 4XX — Client Error
    // 400 — Bad req
    // 403 — Forbidden
    // 404 — Not Found
// 5XX — Server Error
    // 503 — Service Unavailable

router.get('/', async (req, res) => {

    // products.find(req.query, req.params).toArray()
    const options = {}

    categories.find( req.query, options ).toArray()

    .then( value => {
        res.status(200);
        res.send({data: [...value]})
    })
    .catch((err) => {
        res.status(500).send({"error": err.message})
    })

})

router.post('/', (req, res) => {

    const options = {}

    if( Array.isArray(req.body)){

        categories.insertMany(req.body, options)
        .then( value => {
            res.status(200).send( {data: {...value}} )
        })
    
        .catch( err => {
            res.status(500).send({"error": err.message})
        })

    }

    else{
        categories.insertOne(req.body)

        .then( value => {
            res.status(200).send( { data: {...value} } );
        })
    
        .catch( err => {
            res.status(500).send( { error: err.message } );
        })
    }

})

//update one document if filter is matched
//do not create a record if filter is not matched
router.patch('/', (req, res) => {

    const options = {$set : req.body}
    categories.updateMany(req.query, options)

    .then( value => {

        res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })
    
})

//replace record if filter is matched
//or insert new if filter is not matched
router.put('/', (req, res) => {

    const options = {}
    categories.updateMany(
            req.query, 
            { $set : req.body, }, 
            { ...options, upsert: true }
        )

    .then( value => {

        res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })
    
})

router.delete('/', (req, res) => {

    categories.deleteMany(req.query)

    .then( value => {

    res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })

})

// SINGLE CATEGORY ------------------------------------------------------------

router.get('/:id', async (req, res) => {

    try{
    
        let categoryResult;
    
        categoryResult = await getCategoryById(req.params.id)
        if(req.query.expand && req.query.expand == "products"){
            const productsResult = await products.find( {category: categoryResult.name} ).toArray()
        
            categoryResult = {...categoryResult, products : productsResult}
        }
    
        res.status(200).send( {data : {...categoryResult}} )
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send( {error : err.message} )
    }

})

router.patch('/:id', (req, res) => {

    const options = {}
    const query = {_id : new ObjectId(req.params.id), ...req.params.query}

    categories.updateOne(query, {$set : req.body}, options)
    .then( value => {
        res.status(200).send( { data: {...value} } )
    }) 

    .catch(err => {
        res.status(500).send( { error: err.message } );
    })

})

router.put('/:id', (req, res) => {

    const query = {_id : new ObjectId(req.params.id), ...req.params.query}

    categories.replaceOne(query, req.body, {upsert: true})
    .then( value => {

        res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })
    
})

router.delete('/:id', (req, res) => {

    const query = {_id: new ObjectId(req.params.id), ...req.params.query}
    
    categories.deleteOne(query)
    .then( value => {

        res.status(200).send( { data: {...value} } )
    })

    .catch( err => {
        res.status(500).send( { error: err.message } )
    })

})

export default router;