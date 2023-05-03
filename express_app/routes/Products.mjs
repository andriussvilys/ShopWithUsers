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

import express from 'express'
import db from '../conn.mjs'
import {createContact, getContact} from './Contacts/Contacts.mjs'
import { ObjectId } from 'mongodb';

const router = express.Router();
const products = db.collection('products');

const createResponseBody = async (ids) => {
    try{
        return await Promise.all(
            ids.map(async (_id) => {
                // return await products.findOne({_id})
                const product = await products.findOne({_id})
    
                let result = product
                let contact = null;
                if(product.supplier){
                    const supplierId = (typeof product.supplier == "object") ? product.supplier.id : product.supplier

                    contact = (await getContact(supplierId)).data
                    result.supplier = contact
                }
    
                return result
    
            })
        )
    }
    catch(err){
        throw({
            message : "createResponseBody: " + err.message,
            status : err.status ? err.status : 500
        })
    }
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
        throw({"message" : "isContactIdUnique: " + message, status})
    }
}

//if product supplier id unique, create a new supplier record
const validateSupplier = async (product) => {

    try{
        let validatedProduct = product;

        if(product.supplier){
            if(typeof product.supplier == "object"){
                const uniqueId = await isContactIdUnique(product.supplier.id)
                if(uniqueId){
                    await createContact(product.supplier)
                }
            }
            else if(typeof product.supplier == "number"){
                const uniqueId = await isContactIdUnique(product.supplier)
                if(uniqueId){
                    throw {"message": `Non-existing supplier id provided (${product.supplier})`, "status" : 400}
                }             
            }
            else{
                throw {"message": `Invalid supplier data : ${product.supplier}`, "status" : 400}
            }
        }
        return validatedProduct
    }
    catch(err){
        const status = err.status ? err.status : 500
        throw({"message": "validateSupplier : " + err.message, status})
    }
}

const createProduct = async (reqBody) => {
    try{

        if( Array.isArray(reqBody)){

            await Promise.all(
                reqBody.map(async newProduct => {
                    await validateSupplier(newProduct)
                })
            )
            const insertRes = await products.insertMany(reqBody)
            const insertedIds = Object.values(insertRes.insertedIds)
            const resBody =  await createResponseBody(insertedIds)
            
            return resBody
        }
    
        else{

            const validatedReqBody = await validateSupplier(reqBody)
            const insertRes = await  products.insertOne(validatedReqBody)
            const resBody = await  createResponseBody([insertRes.insertedId])

            return resBody

        }
    }
    catch(err){
        const status = err.status ? err.status : 500
        throw({status, "message" : "createProduct : " + err.message})
    }
}

const getProducts = async (query) => {
    try{

        const productsRes = await products.find( query ).toArray()
        const contactData = (await getContact()).data
        const mappedProducts = productsRes.map(product => {
            const contact = contactData.find(contact => contact.id == product.supplier)
            const mappedProduct = {...product, supplier : contact}
            return mappedProduct
        })

        return mappedProducts

    }
    catch(err){
        const status = err.status ? err.status : 500
        throw({"error" : "getProducts : " + err.message, status})
    }

}


router.get('/', async (req, res) => {

    try{
        const mappedProducts = await getProducts(req.query);
        res.status(200).send( mappedProducts )

    }
    catch(err){
        res.status(500).send(err.message)
    }

})

router.post('/', async (req, res) => {

    const options = {}
    // if array of products provided in req.body
    try{
        const resBody = await createProduct(req.body)
        const location = resBody.length > 1 ? '/products' : `products/${resBody[0]._id}`
        res.status(201).set("Location", location).send( resBody )
    }
    catch(err){
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

export {router, createProduct, getProducts};