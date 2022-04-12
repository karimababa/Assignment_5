
// Module Imports and Constants
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyparser = require("body-parser");


const PORT=8000;
const mongo_username='karimababa';
const mongo_password='CMlb8@f*';
const cluster_id='cluster0.jsjgf.mongodb.net';
const db_name='myFirstDatabase';
const collection_name='users';

// Note if the console outputs a "Error: connection <monitor> to 15.184.108.123:27017 closed"
// Please check https://stackoverflow.com/questions/60431996/mongooseerror-mongooseserverselectionerror-connection-monitor-to-52-6-250-2
const uri =`mongodb+srv://${mongo_username}:${mongo_password}@${cluster_id}/${db_name}?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
client.connect((err) => {
    if (err) {
      console.log("Error: " + err.errmsg);
    } else {
      console.log("Connection to database working.");
    }
    client.close();
  });

//Initialize express and add Middlewares
const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


//*************Routing APIs*****************//
// Every api will have a method (get,post,put,delete,...)
// Every api will hold a request & a response
// The URL parameter specifies 
// Use the request parameter (req) to parse and handle client's input data
// Use the response paramete (res) to parse/render the resulting output to the client 
// the returned response can be an HTML page or a JSON object
app.get("/", async (req, res) => {
    client.connect( async (err) => {
        const collection = client.db().collection(collection_name);
        const users = await collection.find().toArray();// get all json objects in the collection
        console.log("All documents=:"+users)
        client.close();
        return res.render("index", { users });// render the ejs file named 'index' and pass the object users
      });
    
  });

//get put push delete 

// Create a user based on client's input and store it in the database
app.post('/user',async (req,res)=>{
    // Create the user JSON object that will be stored in the database
    const user ={
        name:req.body.name,
        age:req.body.age
    }
    client.connect( async (err) => {
        const result = await client.db().collection(collection_name).insertOne(user);
        console.log(`User inserted with id = ${result.insertedId}`);
        client.close();
        res.redirect("/");// this will call the app.get('/') function
      });
});


//Delete the task associated with the given id
app.delete('/task/:id',async(req,res)=>{
  const {username} = req.params;
  const current_task = { _id: ObjectID(id) };
  
  client.connect(async (err) => {
    const result = await client.db().collection("tasks").deleteOne(current_task);
    console.log(`${result.deletedCount} deleted`);
    client.close();
    res.redirect("/");
  });
});

//Update a task’s isComplete attribute
app.put("/task/toggle/:id", (req, res) => {
  const id = req.params.id;
  const current_task = { _id: ObjectID(id) };
  
  client.connect(async (err) => {
    const tasksCollection = client.db().collection("tasks");
    const currentTask = await tasksCollection.findOne(current_task);
    const taskStatus = currentTask.isComplete;
    const newStatus = { isComplete: !taskStatus };
    const result = await client.db().tasksCollection("tasks").updateOne(current_task, { $set: newStatus });
    
    console.log(`${result.matchedCount} matched`);
    
    console.log(`${result.modifiedCount} updated`);
    
    client.close();
    res.redirect("/");
  });
});

//Run the server on port 8000
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });