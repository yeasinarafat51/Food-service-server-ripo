const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-4op8dy6-shard-00-00.v58lgaw.mongodb.net:27017,ac-4op8dy6-shard-00-01.v58lgaw.mongodb.net:27017,ac-4op8dy6-shard-00-02.v58lgaw.mongodb.net:27017/?ssl=true&replicaSet=atlas-z2p65m-shard-0&authSource=admin&retryWrites=true&w=majority`;


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v58lgaw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyjwt(req, res, next){
    const authheader = req.headers.authorization;
    if(!authheader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'unauthorized access'});

        }
        req.decoded = decoded;
        next();

    })
}

async function run(){
    try{
        const foodCollection = client.db('food').collection('servicess');
        const ordercollection = client.db('food').collection('order')
        // const addcollection = client.db('food').collection('abbccddrrrxxx')

        

        app.post('/jwt', async(req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'10h'})
            res.send({token})
        })

        app.get('/service', async(req, res) =>{
            const query = {}
            const cursor = foodCollection.find(query);
            const service = await cursor.limit(3).toArray();
            res.send(service);

        })
        app.get('/servic', async(req, res) =>{
            const query = {}
            const cursor = foodCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);

        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await foodCollection.findOne(query);
            res.send(service);
        })

        // api
        app.get('/orders', verifyjwt, async(req, res) =>{
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
               return res.status(403).send({message:'unauthorized access'})
            }
            let query = {}
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = ordercollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        })


        app.post('/orders', async(req, res) =>{
            console.log(req)
            const order = req.body;
            const result = await ordercollection.insertOne(order);
            res.send(result);
        });

        app.post('/servic', async(req, res) =>{
            console.log(req)
            const add = req.body;
            const result = await foodCollection.insertOne(add);
            res.send(result);
        });
        app.post('/services', async(req, res) => {
            const service = req.body;
            const result = serviceCollections.insertOne(service);
            res.send(result); 
        })

        app.get('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const user = await ordercollection.findOne(query)
            res.send(user);
        })

        app.put('/orders/:id', async (req, res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const user = req.body;
            const option = {upsert:true};
            const update = {
                $set: {
                    text: user.text

                }
            }
            const result = await ordercollection.updateOne(filter, update,option);
            res.send(result);

        })

        app.delete('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)};
            const result = await ordercollection.deleteOne(query);
            res.send(result)
        })

    }
    finally{

    }

}

run().catch(err => console.error(err))


app.get('/', (req, res) =>{
    res.send('server runing')
})

app.listen(port, () =>{
    console.log(`running on ${port}`)
})

