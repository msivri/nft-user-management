var mongo = require('./mongo')
const cors = require('cors');
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(cors())

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/users', async (req, res) => {
    var users = await mongo.getUsers();
    res.send(users)

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.post("/users", jsonParser, (req, res) => {
    mongo.upsertUser(null, { name: req.body.name, address: req.body.address });
    res.send('user added')
})

app.post("/getNonceToSign", jsonParser, async (req, res) => {
    if (!req.body.address) {
        res.status(400).end();
        return;
    }
    const address = req.body.address;
    let nonce = await mongo.upsertUser(address);
    res.send({ nonce: nonce });
})

app.post("/verifySignedMessage", jsonParser, async (req, res) => {
    if (!req.body.address || !req.body.signature ) {
        res.status(400).end();
        return;
    }    
    const address = req.body.address;
    const signature = req.body.signature;
    let result = await mongo.verifyUser(address,signature);
    if (result==='sig invalid'||result==='no data') {
        res.status(400).end();
    }
    res.send(result);
    
})