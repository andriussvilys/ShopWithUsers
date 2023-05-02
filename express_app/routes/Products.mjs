import express from 'express'
import db from '../conn.mjs'
import {createContact, getContact} from './Contacts/Contacts.mjs'
import { ObjectId } from 'mongodb';

const router = express.Router();
const products = db.collection('products');

const createResponseBody = async (ids) => {
    console.log(ids)
    return await Promise.all(
        
        ids.map(async (_id) => {
            return await products.findOne({_id})
        })
    )

}

const isContactIdUnique = async (newId) => {
    try{
        const currentContacts = await getContact();

        const currentIds = currentContacts.data.map(contact => {return contact.id});

        const uniqueId = currentIds.find(currentId => currentId == newId)

        return !uniqueId ? true : false;
    }
    catch(err){
        const status = err.status ? err.status : 500
        const message = err.message ? err.message : "Could not get contact details."
        throw({message, status})
    }
}

const validateNewProduct = async (product) => {

    try{
        let validatedProduct = product;
        if(product.supplier){
    
            const uniqueId = await isContactIdUnique(product.supplier.id)
            console.log(`uniqueId ${product.supplier.id} : ${uniqueId}`)
            if(uniqueId){
                const createContactRes = await createContact(product.supplier)
                validatedProduct.supplier = createContactRes.data
            }
            else{
                const getContactRes = await getContact(product.supplier.id)
                validatedProduct.supplier = getContactRes.data
            }
        }
        return validatedProduct
    }
    catch(err){
        const status = err.status ? err.status : 500
        throw({"message": err.message, status})
    }
}

const createProduct = async (reqBody) => {
    const options = {}
    console.log("createProduct : ---------------------------")
    console.log(reqBody)
    try{

        if( Array.isArray(reqBody)){

            const validatedReqBody = await Promise.all(
                reqBody.map(async (product) => await validateNewProduct(product))
                );

            const insertRes = await products.insertMany(validatedReqBody, options)
            const insertedIds = Object.values(insertRes.insertedIds)

            const resBody =  await createResponseBody(insertedIds)
            
            return resBody
        }
    
        else{

            const validatedReqBody = await validateNewProduct(reqBody)
            const insertRes = await  products.insertOne(validatedReqBody)
            const resBody = await  createResponseBody([insertRes.insertedId])

            return resBody

        }
    }
    catch(err){
        // const status = err.status ? err.status : 500
        const status = 500
        throw({status, "message" : err.message})
    }
}

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

    const options = {}

    products.find( req.query, options ).toArray()

    .then( find_res => {
        res.status(200).send( find_res )
    })
    .catch((err) => {
        res.status(500).send({"error": err.message})
    })

})

router.post('/', async (req, res) => {

    const options = {}
    // if array of products provided in req.body
    try{
        const resBody = await createProduct(req.body)
        res.status(201).send( resBody )
    }
    catch(err){
        console.log("POST ERR")
        console.log(err)
        res.status(500).send({"error" : err.message})
    }

})

//update one document if filter is matched
//do not create a record if filter is not matched
router.patch('/', async (req, res) => {

    try{
        const options = {}
        const query = req.query
        const findRes = await products.find(query, options).toArray()
        const updateRes = await products.updateMany(query, {$set : req.body})
    
        let updatedDocs;
        if(updateRes.modifiedCount > 0){
            const ids = findRes.map(item => item._id)
            updatedDocs = await createResponseBody(ids)
        }
    
        res.status(200).send(updatedDocs)
    }
    catch(err){
        res.status(500).send({"error": err.message})
    }

    
})

//replace record if filter is matched
//or insert new if filter is not matched
router.put('/', async (req, res) => {

    const options = {}
    const query = req.query

    try{
        const findRes = await products.find( query, options ).toArray()

        let updateData = findRes.map(item => {
                return    {     
                         replaceOne: {
                            filter: { _id: item._id },
                            replacement: { ...req.body }
                        }
                    }
        })

        const bulkWrite_res = await products.bulkWrite(updateData)

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

})

router.delete('/', (req, res) => {

    products.deleteMany(req.query)

    .then( delete_res => {

    res.status(200).send( delete_res )

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })

})

export {router, createProduct};