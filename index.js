const express = require('express')
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());0
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0iyuemt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run(){
    try{
        await client.connect();
        const categoryCollection = client.db('lens-lab').collection('Categories');
        const dslrCollection = client.db('lens-lab').collection('dslrCamera');

        app.get('/categories', async(req,res)=>{
            const query = {};
            const result = await categoryCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/categories/:id', async(req,res)=>{
          const id = req.params.id;
          console.log(id);
            const query = {categoriesId:id};
            const result = await dslrCollection.find(query).toArray();
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})