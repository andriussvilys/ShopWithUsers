import express from 'express'
import db from '../conn.mjs'

const router = express.Router();
const products = db.collection('products');

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

    .then( value => {
        res.status(200).send({data: [...value]})
    })
    .catch((err) => {
        res.status(500).send({"error": err.message})
    })

})

router.post('/', (req, res) => {

    const options = {}

    if( Array.isArray(req.body)){

        products.insertMany(req.body, options)
        .then( value => {
            res.status(200).send( {data: {...value}} )
        })
    
        .catch( err => {
            res.status(500).send({"error": err.message})
        })

    }

    else{
        products.insertOne(req.body)

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

    const options = {}
    products.updateMany(req.query, {$set : req.body})

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

    products.find( req.query, options ).toArray()
    .then( value => {

        let updateData = []

        value.forEach(item => {
            updateData.push(
                    {     
                         replaceOne: {
                            filter: { _id: item._id },
                            replacement: { ...req.body }
                        }
                    }
                )
        })

        // updateData.forEach(item => console.log(item))

        products.bulkWrite(updateData)
        .then(bulkWriteResponse => {
            res.status(200).send({data: bulkWriteResponse})
        })
        .catch(bulkWriteError => {
            res.status(500).send({"error": bulkWriteError.message})
        })

    })
    .catch((err) => {
        res.status(500).send({"error": err.message})
    })

})

router.delete('/', (req, res) => {

    products.deleteMany(req.query)

    .then( value => {

    res.status(200).send({data: {...value}})

    })

    .catch( err => {
        res.status(500).send({"error": err.message})
    })

})

export default router;