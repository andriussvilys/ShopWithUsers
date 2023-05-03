import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';
import {getCategoryById} from './ProductsByCategory.mjs'

const router = express.Router();
const categories = db.collection('categories');
const products = db.collection('products');

const createResponseBody = async (ids) => {

    return await Promise.all(
        
        ids.map(async (_id) => {
            return await categories.findOne({_id})
        })
    )

}

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

    .then( find_res => {
        res.status(200).send(find_res)
    })
    .catch((err) => {
        res.status(500).send({"error": err.message})
    })

})

router.post('/', async (req, res) => {

    const options = {}

    try{
        if( Array.isArray(req.body)){

            const insertRes = await categories.insertMany(req.body, options)
    
            const insertedIds = Object.values(insertRes.insertedIds)

            const responseBody = await createResponseBody(insertedIds)

            res.status(201).set('Location', `/categories`).send( responseBody )
    
        }
        else{
            const insertRes = await categories.insertOne(req.body)

            const insertedId = insertRes.insertedId

            const responseBody = await createResponseBody([insertedId])
    
            res.status(201).set('Location', `/categories/${insertRes.insertedId}`).send( responseBody )
        }
    }
    catch(err){
        res.status(500).send({"error" : err.message})
    }

})

//update one document if filter is matched
//do not create a record if filter is not matched
router.patch('/', async (req, res) => {

    try{

        const query = req.query
        const options = {$set : req.body}
        const findRes = await categories.find(query).toArray()
        const updateRes = await categories.updateMany(req.query, options)

        let result = []
        if(updateRes.modifiedCount > 0){
            const ids = findRes.map(elem => {
                return elem._id
            })
            result = await createResponseBody(ids)
        }

        res.status(200).send( result )
    }
    catch(err){

    }
    
})

//replace record if filter is matched
//or insert new if filter is not matched
router.put('/', async (req, res) => {

    const options = {}
    const query = req.query

    try{
        const findRes = await categories.find( query, options ).toArray()

        let updateData = findRes.map(item => {
                return    {     
                         replaceOne: {
                            filter: { _id: item._id },
                            replacement: { ...req.body }
                        }
                    }
        })

        const bulkWrite_res = await categories.bulkWrite(updateData)

        let updatedDocs;
        if(bulkWrite_res.modifiedCount > 0 || bulkWrite_res.upsertedCount > 0){
            const ids = findRes.map(item => item._id)
            updatedDocs = await createResponseBody(ids)
        }
        res.status(200).send(updatedDocs)

    }
    catch(err){
        res.status(500).send({"error" : err.message})
    }

    // const options = {}
    // categories.updateMany(
    //         req.query, 
    //         { $set : req.body, }, 
    //         { ...options, upsert: true }
    //     )

    // .then( value => {

    //     res.status(200).send({data: {...value}})

    // })

    // .catch( err => {
    //     res.status(500).send({"error": err.message})
    // })
    
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
    
        res.status(200).send( categoryResult )
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send( {error : err.message} )
    }

})

router.patch('/:id', async (req, res) => {

    try{

        const options = {}
        const query = {_id : new ObjectId(req.params.id), ...req.params.query}
    
        const updateRes = await categories.updateOne(query, {$set : req.body}, options)
    
        let updatedDoc = {}
        if(updateRes.modifiedCount > 0){
            const findRes = await categories.findOne(query)
            updatedDoc = findRes
        }
    
        res.status(200).send( updatedDoc )
        
    }
    catch(err){
        res.status(500).send( {"error" : err.message} )
    }

})

router.put('/:id', async (req, res) => {

    try{
        const query = {_id : new ObjectId(req.params.id), ...req.params.query}

        const replaceRes = await categories.replaceOne(query, req.body, {upsert: true})
        
        let updatedDoc = {}
        if(replaceRes.modifiedCount > 0 || replaceRes.upsertedCount > 0){
            const findRes = await categories.findOne(query)
            updatedDoc = findRes
        }
    
        res.status(200).send( updatedDoc )
    }
    catch(err){
        res.status(500).send({"error": err.message})
    }

    
})

router.delete('/:id', (req, res) => {

    const query = {_id: new ObjectId(req.params.id), ...req.params.query}
    
    categories.deleteOne(query)
    .then( delete_res => {

        res.status(200).send( delete_res )
    })

    .catch( err => {
        res.status(500).send( { error: err.message } )
    })

})

export default router;