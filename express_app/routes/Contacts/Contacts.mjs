import express from 'express'
import axios from 'axios';
import db from '../../conn.mjs'

const router = express.Router();

const products = db.collection('products');


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
            console.log("contact expand products")
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

        const result = await axios.post('http://contacts:5000/contacts', req.body)
        res.status(200).send(result)
    }
    catch(err){
        const status = err.status ? err.status : 500
        res.status(status).send(err)
    }
})

router.put('/:id', async (req, res) => {
    axios.put(`http://contacts:5000/contacts/${req.params.id}`, req.body)
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(error => {
        console.log("AXIOS ERRR")
        res.status(500).send(error)
    });

})
router.delete('/:id', async (req, res) => {
    axios.delete(`http://contacts:5000/contacts/${req.params.id}`)
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(error => {
        console.log("AXIOS ERRR")
        res.status(500).send(error)
    });

})

export default router;