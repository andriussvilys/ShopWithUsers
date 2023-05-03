import express from 'express'
import axios from 'axios';
import db from '../../conn.mjs'

const router = express.Router();

const products = db.collection('products');

const getContact = async (id) => {
    try{
        let getResponse;
        if(id){
            getResponse = await axios.get(`http://contacts:5000/contacts/${id}`)
        }
        else{
            getResponse = await axios.get(`http://contacts:5000/contacts`)
        }
        return getResponse
    }
    catch(err){
        const status = err.response && err.response.status ? err.response.status : (err.status ? err.status : 500)
        const message = err.response && err.response.data ? err.response.data : err.message 
        throw({status, message : "getContact : " + message})
    }
}

const createContact = async (contactObj) => {
    try{
        const postRes = await axios.post('http://contacts:5000/contacts', contactObj)
        const getRes = await getContact(contactObj.id)
        return getRes
    }
    catch(err){
        const status = err.response && err.response.status ? err.response.status : (err.status ? err.status : 500)
        const message = err.response && err.response.data ? err.response.data : err.message 
        throw({status, message : "createContact : " + message})
    }
}

// ROUTES ----------------------------------------------------

router.get('/', async (req, res) => {
    axios.get('http://contacts:5000/contacts')
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(error => {
        res.status(500).send(error)
    });

})

router.get('/:id', async (req, res) => {

    try{

        let response;
        const contactResponse = await axios.get(`http://contacts:5000/contacts/${req.params.id}`)
        const query = req.query
        if(query.expand && query.expand == "products"){
            const productsResult = await products.find( {supplier: contactResponse.data.id} ).toArray()
            response = {...contactResponse.data, products : productsResult}
        }
        else{
            response = contactResponse.data
        }

        res.status(200).send(response)
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send(err)
    }

})

router.post('/', async (req, res) => {
    try{
        const postRes = await createContact(req.body)
        res.status(200).set('Location', `/contacts/${req.body.id}`).send(postRes.data)
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send(err.message)
    }
})

router.put('/:id', async (req, res) => {
    axios.put(`http://contacts:5000/contacts/${req.params.id}`, req.body)
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(error => {
        res.status(500).send(error)
    });

})

router.delete('/:id', async (req, res) => {
    axios.delete(`http://contacts:5000/contacts/${req.params.id}`)
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(error => {
        res.status(500).send(error)
    });

})

// export default router;
export {router, getContact, createContact}