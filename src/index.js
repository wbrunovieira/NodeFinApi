const { response } = require('express');
const express = require('express');

const app = express();

app.listen('3333')

app.get('/', (require, response) => {
    response.send('teste')
})
