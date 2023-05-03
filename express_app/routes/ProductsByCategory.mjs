import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';
import { createProduct, getProducts } from './Products.mjs';

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

        const productsResponse = await getProducts(query)
        res.status(200).send(productsResponse)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

router.post('/:id/products', async (req, res) => { 

    try{
        let requestBody_temp = req.body;

        if( !Array.isArray(req.body)){

            requestBody_temp = [req.body]
    
        }

        const category = await getCategoryById(req.params.id)
        const requestBody = requestBody_temp.map(product => {return {...product, category: category.name}})

        const resBody = await createProduct(requestBody)

        const location = resBody.length > 1 ? '/products' : `products/${resBody[0]._id}`
        res.status(201).set("Location", location).send( resBody )

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

        res.status(200).send(productsResponse)

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

export default router;