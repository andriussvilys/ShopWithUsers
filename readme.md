# RESTful Shop API in Docker Container
Shop contains products, products have categories and contacts (suppliers)
- Express.js + mongodb API + PostgresAPI
- Uses official Mongo image
- No database schema
- CRUD operations 
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Resources:\
-- Products \
-- Categories \
-- Contacts
- URLS:
-- GET/POST/PUT/PATCH/DELETE /products\
-- GET/POST/PUT/PATCH/DELETE /categories\
-- GET/PUT/PATCH/DELETE /products/:id\
-- GET/PUT/PATCH/DELETE /categories/:id\
-- GET/PUT/PATCH/DELETE /categories/:id/products\
-- GET /categories/:id?expand=products \
-- GET/POST /contacts \
-- GET/PUT/DELTE /contacts/:id
-- GET /contacts/:id?expand=products
- uses PORT 80

### LAUNCH CONTAINER

```sh
cd [inside cloned git repo directory]
```
_then_
```sh
docker-compose up 
```
_OR run in detached (background) mode_
```sh
docker-compose up -d
```
### USE
Once the container is launced, open browser or API management platform like Postman and enter 
localhost:/80/[resource]  
eg:  
localhost:80/products  
localhost:80/categories/dairy/products  

### STOP CONTAINER
_if in detached mode_
```sh
docker-compose down
```
_otherwise_
_use CTRL + C in command window_