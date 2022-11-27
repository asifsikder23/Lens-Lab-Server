const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
0;
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0iyuemt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("lens-lab").collection("users");
    const categoryCollection = client.db("lens-lab").collection("Categories");
    const dslrCollection = client.db("lens-lab").collection("dslrCamera");
    const bookingsCollection = client.db("lens-lab").collection("booking");

    // jwt
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });

    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "Buyer" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/users/admin/:id", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const query = { email: decodedEmail };
      // const user = await usersCollection.findOne(query);

      // if (user?.role !== 'admin') {
      //     return res.status(403).send({ message: 'forbidden access' })
      // }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { categoriesId: id };
      const result = await dslrCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/categories", async (req, res) => {
      const query = req.body;
      const result = await dslrCollection.insertOne(query);
      res.send(result);
    });
    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
  });

  app.post('/bookings', async (req, res) => {
      const booking = req.body;

      const query = {
          productName: booking.productName,
          email: booking.email,
          customerName: booking.customerName
      }
      console.log(query);
      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length > 0) {
          const message = `You already have booked ${booking.productName}`
          return res.send({ acknowledged: false, message })
      }

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  });

  app.delete("/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send({
        success: true,
        data: result,
      });
    } catch (error) {
      res.send({
        success: false,
        error: error.message,
      });
    }
  });

  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
