## Endpoints

#### product

GET /product
POST /product

GET /product/:id
PUT /product/:id
DELETE /product/:id

#### trash

GET /product/trash

GET /product/trash/:id
PATCH /product/trash/:id/restore

#### stock

GET /product/stock

GET /product/stock-in
GET /product/stock-out

POST /product/stock-in
POST /product/stock-out

#### movements

GET /product/stock/movement
