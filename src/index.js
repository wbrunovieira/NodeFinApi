const { response } = require('express');
const express = require('express');
const { v4:uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyIfAccountExistsCPF(request, response, next) {
    const { cpf } = require.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return response.status(400).json({error:"customer not found"})
    }

    request.customer = customer;

    return next();
}

app.listen('3333')

app.get('/', (require, response) => {
    response.send('teste')
})

app.post('/account', (require, response) => {

    const { cpf, name } = require.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if(customerAlreadyExists) {
        return response.status(401).json({ error: "Custumer already exits"})
    }
    

    customers.push({
        cpf,
        name,
        id:uuidV4(),
        statement: [] 
    })

    return response.status(201).send()
})

app.get('/statement/', verifyIfAccountExistsCPF,(require, response) => {
    
    const {  customer } = request

    return response.json(customer.statement);

})
