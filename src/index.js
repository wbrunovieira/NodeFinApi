const { response } = require('express');
const express = require('express');
const { v4:uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyIfAccountExistsCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return response.status(400).json({error:"customer not found"})
    }

    request.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc = operation.amount;
        }
    }, 0)

    return balance;
}

app.listen('3333')

app.get('/', (request, response) => {
    response.send('teste')
})

app.post('/account', (request, response) => {

    const { cpf, name } = request.body;

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

app.get('/statement/', verifyIfAccountExistsCPF,(request, response) => {
    
    const {  customer } = request

    return response.json(customer.statement);

});

app.post('/deposit',verifyIfAccountExistsCPF, (request, response) => {
    const { description, amount } = request.body

    const { customer } = request

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    }

    customer.statement.push(statementOperation);

    return response.status(201).send()

})

app.post('/withdraw', verifyIfAccountExistsCPF, (request, response) => {
    const { amount } = request.body

    const {  customer } = request

    const balance = getBalance(customer.statement)

    if(balance < amount) {
        return response.status(401).json({ error:"Isufficient funds"})
    }

    const statementOperation = {
       
        amount,
        created_at: new Date(),
        type: "debit",
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();

})

app.get('/statement/date', verifyIfAccountExistsCPF,(request, response) => {
    
    const {  customer } = request

    const { date } = request.query

    const formatedDate = new Date(date + " 00:00");

    const resultStatement = customer.statement.filter(
        (statement) =>
          statement.created_at.toDateString() ===
          new Date(formatedDate).toDateString()
      );
    

    return response.json(resultStatement);

});

app.put('/account', verifyIfAccountExistsCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send()
});

app.get('/account', verifyIfAccountExistsCPF, (request, response) => {

    const {  customer} = request;

    return response.status(201).json(customer);
});

app.delete('/account', verifyIfAccountExistsCPF, (request, response) => {
    const {  customer } = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers)
})

app.get('/balance', verifyIfAccountExistsCPF, (request, response) => {

    const {  customer} = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})
