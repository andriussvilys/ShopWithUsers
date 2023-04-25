import express from 'express'
import db from '../conn.mjs'
import { ObjectId } from 'mongodb';

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

router.get('/:id/products', async (req, res) => {

    try{
        const category = await getCategoryById(req.params.id)
        console.log(category)

        const productsResponse = await products.find( {category : category.name} ).toArray()

        res.status(200).send({data: productsResponse})

    }
    catch(err){
        console.log("GET THROW ERROR")
        console.log(err)
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

})

router.post('/:id/products', async (req, res) => {

    try{
        const category = await getCategoryById(req.params.id)

        let productsResponse;

        if( Array.isArray(req.body)){

            const body = req.body.map(elem => {return {...elem, category: category.name}})

            productsResponse = await products.insertMany(body)
        }
        else{

            productsResponse = await products.insertOne({...req.body, category: category.name})

        }

        res.status(200).send({data: productsResponse})

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

        const productsResponse = await products.updateMany({category: category.name}, {$set : req.body})

        res.status(200).send({data: productsResponse})

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

        const productsResponse = await products.find( {category : category.name} ).toArray()

        const updateData = productsResponse.map(product => {
            return {replaceOne: {
                filter: { _id: product._id },
                replacement: { ...req.body}
                // replacement: { ...req.body, category : category.name }
                }
            }
        })

        const bulkWriteResponse = await products.bulkWrite(updateData)

        res.status(200).send({data: bulkWriteResponse})

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

        res.status(200).send({data: productsResponse})

    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send({"error": err.message})
    }

    // const options = {}
    // const query = {_id : new ObjectId(req.params.id), ...req.params.query}

    // categories.findOne(query, options)
    // .then(response => {

    //     products.deleteMany({category : response.name})

    //     .then( value => {
    
    //         res.status(200).send({data: {...value}})
    
    //     })
    
    //     .catch( err => {
    //         res.status(500).send({"error": err.message})
    //     })
    // })
    // .catch(err => {
    //     res.status(500).send({"error": err.message})
    // })



})

export default router;