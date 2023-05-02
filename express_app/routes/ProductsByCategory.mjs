import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';
import { createProduct } from './Products.mjs';

const router = express.Router();
const categories = db.collection('categories');
const products = db.collection('products');

export const getCategoryById = async (id) => {

    let _id
    try{
        _id = getObjectId(id)
    }
    catch(err){
        //throw status 400 - bad request
        throw err
    }

    try{
        const category =  await categories.findOne({_id})

        if(!category ){
            throw ({"message": `Category with id ${id} is not found`,"status": 400})
        }
        if(!category.name ){
            throw ({"message": `Category name not found`,"status": 400})
        }
        return category
    }
    catch(err){
        const status = err.status ? err.status : 500 
        throw {...err, "status": status}
    }
}

const getObjectId = (id) => {
    try{
        const _id = new ObjectId(id)
        return _id
    }
    catch(err){
        throw({"message": err.message, "status": 400})
    }
}

const createResponseBody = async (ids, collection) => {
    return await Promise.all(
        
        ids.map(async (_id) => {
            return await collection.findOne({_id})
        })
    )

}

router.get('/:id/products', async (req, res) => {

    try{
        const category = await getCategoryById(req.params.id)
        const query = {...req.query, "category" : category.name}
        const productsResponse = await products.find( query ).toArray()
        console.log(productsResponse)
        res.status(200).send(productsResponse)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

router.post('/:id/products', async (req, res) => { 

    try{
        const category = await getCategoryById(req.params.id)

        if( Array.isArray(req.body)){

            const requestBody = req.body.map(elem => {return {...elem, category: category.name}})

            const responseBody = await createProduct(requestBody)

            res.status(201).set('Location', `/products`).send( responseBody )
    
        }
        else{
            const requestBody = {...req.body, category: category.name}

            const responseBody = await createProduct(requestBody)
    
            res.status(201).set('Location', `/products/${req.body.id}`).send( responseBody )
        }
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

//update one document if filter is matched
//do not create a record if filter is not matched
router.patch('/:id/products', async (req, res) => {

    try{
        const category = await getCategoryById(req.params.id)
        
        const query = {...req.query, "category" : category.name }
        //find products that match initial query
        const findRes = await products.find(query).toArray()
        
        const updateRes = await products.updateMany(query, {$set : {...req.body}})

        let result = []
        if(updateRes.modifiedCount > 0){
            const ids = findRes.map(elem => {
                return elem._id
            })
            result = await createResponseBody(ids, products)
        }

        res.status(200).send(result)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }
    
})

//REPLACE record if filter is matched
//or insert new if filter is not matched
router.put('/:id/products', async (req, res) => {

    try{

        const category = await getCategoryById(req.params.id)

        const query = {...req.query, "category" : category.name }
        //find products that match initial query
        const findRes = await products.find(query).toArray()

        const productsResponse = await products.find( query ).toArray()

        const updateData = productsResponse.map(product => {
            return {replaceOne: {
                    filter: { _id: product._id },
                    replacement: { ...req.body}
                }
            }
        })

        const bulkWrite_res = await products.bulkWrite(updateData)

        let updatedDocs;
        if(bulkWrite_res.modifiedCount > 0 || bulkWrite_res.upsertedCount > 0){
            const ids = findRes.map(item => item._id)
            updatedDocs = await createResponseBody(ids, products)
        }

        res.status(200).send(updatedDocs)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }
    
})

router.delete('/:id/products', async (req, res) => {

    try{
        const category = await getCategoryById(req.params.id)

        const productsResponse = await products.deleteMany({category : category.name})
        console.log("products by category")
        console.log(productsResponse)
        res.status(200).send(productsResponse)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

export default router;