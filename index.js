require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.port || 3000;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())



// varify token
const verifyToken=(req,res,next)=>{
  const token=req.cookies.token;
  // console.log(token)
  if(!token){
    return res.status(401).send({message:"Unauthorized: Please log in first."})
  }
  jwt.verify(token,process.env.JWT_ACCESS_SECRET,(err,decoded)=>{
    // console.log(decoded)
    if(err){
      return res.status(401).send({message:"Unauthorized: Please log in first."})
    }
    req.decoded=decoded
    next()
  })
}

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
    const applicationsCollection = client
      .db("careerCodeDB")
      .collection("applications");
   
    //jwt token related api
    app.post("/jwt",async(req,res)=>{
      const {email}=req.body;
      const user={email}
      // console.log(user)
      const token=jwt.sign(user,process.env.JWT_ACCESS_SECRET,{expiresIn:"1d"})
      // console.log(token)
      res.cookie("token",token,{httpOnly:true,secure:false})
      res.send({success:true})
    })
    //jobs api
    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
        // console.log("after the client jobs",req.cookies)
      const query = {};
      if (email) {
        query.hr_email = email;
      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    // //could not show the bad idea
    // app.get("/jobsByEmailAddress",async(req,res)=>{
    //   const email=req.query.email;
    //   const query={hr_email:email}
    //   const result=await jobsCollection.find(query).toArray()
    //   res.send(result)
    // })
    app.get("/jobs/applications", async (req, res) => {
      const email = req.query.email;
      const query = { hr_email: email };
      const jobs = await jobsCollection.find(query).toArray();
      //should use aggrigate to optimum data fatching
      for (const job of jobs) {
        const applicationsQuery = { jobId: job._id.toString() };
        const application_count = await applicationsCollection.countDocuments(
          applicationsQuery
        );
        job.application_count = application_count;
      }
      res.send(jobs);
    });
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const cursor = req.body;
    
      const result = await jobsCollection.insertOne(cursor);
      res.send(result);
    });
    //Applicaions Api
    app.post("/applications", async (req, res) => {
      const doc = req.body;

      const result = await applicationsCollection.insertOne(doc);
      res.send(result);
    });
    app.get("/applications",verifyToken, async (req, res) => {
      const email = req.query.email;
     if(email!==req.decoded.email){
      return res.status(403).send({message: "Forbidden: You don't have access to this page." })
     }
      const query = {
        applicant: email,
      };

      // console.log("after the client", req.cookies);
      const cursor = applicationsCollection.find(query);
      const result = await cursor.toArray();

      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollection.findOne(jobQuery);
        application.company = job.company;
        application.company_logo = job.company_logo;
      }
      res.send(result);
    });

    app.delete("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicationsCollection.deleteOne(query);
      res.send(result);
    });
    //holder job creater
    app.get("/applications/job/:job_id", async (req, res) => {
      const job_id = req.params.job_id;
      const query = { jobId: job_id };
      const result = await applicationsCollection.find(query).toArray();
      res.send(result);
    });
    app.patch("/applications/:id", async (req, res) => {
      const applicaionId = req.params.id;
      const filter = { _id: new ObjectId(applicaionId) };
      const updatedDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await applicationsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
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
