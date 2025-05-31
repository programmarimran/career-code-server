require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.port || 3000;
const cors = require("cors");
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdhp12d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const jobsCollection = client.db("careerCodeDB").collection("jobs");
    const applicationsCollection=client.db("careerCodeDB").collection("applications")


    //jobs api
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/jobs/:id",async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await jobsCollection.findOne(query)
      res.send(result)
    })
    //Applicaions Api
    app.post("/applications",async(req,res)=>{
      const doc=req.body;
      const result=await applicationsCollection.insertOne(doc)
      res.send(result)
    })
    app.get("/applications",async(req,res)=>{
      const email=req.query.email;
      const query={
        applicant:email
      }
      const cursor=applicationsCollection.find(query)
      const result= await cursor.toArray()

      for(const application of result){
        const jobId=application.jobId
        const jobQuery={_id:new ObjectId(jobId)}
        const job=await jobsCollection.findOne(jobQuery)
        application.company=job.company;
        application.company_logo=job.company_logo

      }
      res.send(result)
    })
    app.delete("/applications/:id",async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await applicationsCollection.deleteOne(query)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("career code server is running....");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
