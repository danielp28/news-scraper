var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs")

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models")

var PORT = 3000;

// Initialize Express
var app = express();
var Comment = require("./models/comment")
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";



// Configure middleware


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
      .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
 db.Article.find({},function(err, result){
    if(err){
        console.log(err);
    }else{
        res.json(result)
    }
 })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({
      _id: mongojs.ObjectId(req.params.id)
  }, function(err, result){
      if(err){
          console.log(err)
      }else{
          res.send(result)
      }
  }).populate("comment")
  
  
    // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    var comment = new Comment ({
        title: req.body.title,
        body: req.body.body
    });

    comment.save().then(function (err, result){
        if (err){
            throw err
        } else {
            console.log(result)
        }
    })
  db.Article.updateOne({
      _id: mongojs.ObjectId(req.params.id)
  }, 
  {
      $set: {
          comment : comment._id
      }
  },
  function(err, result){
      if(err){
          console.log(err)
      }else{
          res.send(result)
      }
  })
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});