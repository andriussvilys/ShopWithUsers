import {router as ProductsRouter} from './routes/Products.mjs'
import ProductRouter from './routes/Product.mjs'
import CategoriesRouter from './routes/Categories.mjs'
import ProductsByCategoryRouter from './routes/ProductsByCategory.mjs'
import {router as ContactsRouter} from './routes/Contacts/Contacts.mjs'
import express from 'express';
import axios from 'axios'
import db from './conn.mjs'

const app = express();
const PORT = 80;

app.use(express.json());

app.use('/products', ProductsRouter);
app.use('/products', ProductRouter);
app.use('/categories', CategoriesRouter);
app.use('/categories', ProductsByCategoryRouter);
app.use('/contacts', ContactsRouter);

app.listen(PORT, () => {
    console.log(`\nExpress listening on PORT ${PORT}`)
})

// ** INITIAL DATA
const categoriesData = [
    {
        "name": "dairy",
        "description": "Nice, fresh and milky."
    },
    {
        "name": "meat",
        "description": "Locally sourced, ethically raised."
    }]

const productsData = [
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
    }]

try{
    const products = db.collection('products');
    const categories = db.collection('categories');

    const contactsResponse = await axios.get('http://contacts:5000/contacts')

    const contactsData = contactsResponse.data

    const productsWithContacts = productsData.map((product, index) => {
        const supplier = contactsData[index%contactsData.length]
        return {...product, supplier}
    })

    const categoriesResponse = await categories.insertMany(categoriesData)

    // const productsResponse = await products.insertMany(productsData)
    const productsResponse = await products.insertMany(productsWithContacts)
    
    
}
catch(e){
    console.error(e)
}
