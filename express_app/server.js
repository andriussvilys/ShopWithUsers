import ProductsRouter from './routes/Products.mjs'
import ProductRouter from './routes/Product.mjs'
import CategoriesRouter from './routes/Categories.mjs'
import ProductsByCategoryRouter from './routes/ProductsByCategory.mjs'
import express from 'express';
import db from './conn.mjs'

const app = express();
const PORT = 80;

app.use(express.json());

app.use('/products', ProductsRouter);
app.use('/products', ProductRouter);
app.use('/categories', CategoriesRouter);
app.use('/categories', ProductsByCategoryRouter);

app.listen(PORT, () => {
    console.log(`\nExpress listening on PORT ${PORT}`)
})

// ** INITIAL DATA
try{

    const products = db.collection('products');
    const categories = db.collection('categories');

    categories.insertMany(
        [
            {
                "name": "dairy",
                "description": "Nice, fresh and milky."
            },
            {
                "name": "meat",
                "description": "Locally sourced, ethically raised."
            }
        ]
    )
    .then((res) => {
        console.log({data: res});

        products.insertMany(
            [
                {
                    "name": "kefir",
                    "price": 2.99,
                    "category": "dairy"
                },
                {
                    "name": "super kefir",
                    "price": 3.99,
                    "category": "dairy"
                },
                {
                    "name": "chicken",
                    "price": 3.99,
                    "category": "meat"
                }
            ]
        )
        .then((res) => {
            console.log({data: res});
        })
        .catch( err => {console.error(err)})

    })
    .catch( err => {console.error(err)})
    
}
catch(e){
    console.error(e)
}

//