const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 5500;

app.get("/", (req, res) => {
  res.send("Hello the FootSto app is working working!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g5ktv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
    console.log("Connection err", err);
    const AdminCollection = client.db("footsto").collection("admins");
    const ProductCollection = client.db("footsto").collection("product");
    const OrderCollection = client.db("footsto").collection("order");
    const ReviewCollection = client.db("footsto").collection("review");
    const CartCollection = client.db("footsto").collection("cart");

    app.get("/isAdmin",(req,res)=>{
        AdminCollection.find({email: req.query.email}).toArray((err,docs)=>{
            res.send(!!docs.length);
        })
    })
    
    app.get("/product",(req,res)=>{
        ProductCollection.find().toArray((err,docs)=>{
            res.send(docs);
        })
    })

    app.get("/cart",(req,res)=>{
        CartCollection.find({email: req.query.email}).toArray((err,docs)=>{
            res.send(docs);
        })
    })

    app.get("/order",(res,req)=>{
        AdminCollection.find({email: req.query.email}).toArray((err,docs)=>{
            if(docs.length){
                OrderCollection.find().toArray((err,docs)=>{
                    res.send(docs);
                })
            }
            else{
                OrderCollection.find({email: req.query.email}).toArray((err,docs)=>{
                    res.send(docs);
                })
            }
        })
    })



    app.post("/addAdmin",(req,res)=>{
        AdminCollection.insertOne(req.body).then((result)=>{
            res.send(!!result.insertedCount > 0);
        });
    });

    app.post("/addOrder",(req,res)=>{
        OrderCollection.insertOne(req.body).then((result)=>{
            res.send(!!result.insertedCount > 0);
        });
    });

    app.post("/addReview",(req,res)=>{
        ReviewCollection.insertOne(req.body).then((result)=>{
            res.send(!!result.insertedCount > 0);
        });
    });

    app.post("/addToCart",(req,res)=>{
        CartCollection.insertOne(req.body).then((result)=>{
            res.send(!!result.insertedCount > 0);
        });
    });

    app.post("/addProduct",(req,res)=>{
        ProductCollection.insertOne(req.body).then((result)=>{
            res.send(!!result.insertedCount > 0);
        });
    });

    app.delete("/deleteProduct/:id",(req,res)=>{
        ProductCollection.deleteOne({_id: ObjectId(req.params.id)}).then((result)=>{
            res.send(!!result.deletedCount)
        });
    });

    app.delete("/deleteCart/:id",(req,res)=>{
        CartCollection.deleteOne({_id: ObjectId(req.params.id)}).then((result)=>{
            res.send(!!result.deletedCount)
        });
    });

    app.delete("/deleteReview/:id",(req,res)=>{
        ReviewCollection.deleteOne({_id: ObjectId(req.params.id)}).then((result)=>{
            res.send(!!result.deletedCount)
        });
    });

    app.patch("/updateOrderStatus",(req,res)=>{
        const {id, status} = req.body;
        OrderCollection.findOneAndUpdate(
            {_id: ObjectId(id)},
           { $set: {status}}
            )
            .then((result)=>{
                res.send(result.lastErrorObject.updatedExisting)
            });
    });
    
    app.patch("/updateProduct/:id",(req,res)=>{
        ProductCollection.updateOne(
            {_id: ObjectId(req.params.id)},
            {$set:req.body},
        )
        .then((result)=>{
            res.send(!!result.modifiedCount);
        });
    });
    
    app.patch("/updateReview/:id",(req,res)=>{
        ReviewCollection.updateOne(
            {_id: ObjectId(req.params.id)},
            {$set:req.body},
        )
        .then((result)=>{
            res.send(!!result.modifiedCount);
        });
    });

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });