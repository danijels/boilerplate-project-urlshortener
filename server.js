require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');

const { Schema } = mongoose;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = {
  originalUrl: String,
  shortUrl: String
}

const Url = mongoose.model("Url", urlSchema);

function createAndSaveUrl(val, done) {
  const url = new Url({
    originalUrl: val
  });
  url.shortUrl = url._id.toString().slice(-7);
  
  url.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
}

function findByShortUrl(short, done) {
  Url.findOne( {shortUrl: short}, (err, url) => {
    if (err) console.error(err);
    done(null, url.originalUrl);
  });
}

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl/new", (req, res) => {
  const url = req.body.url;
  if (!/https|http/.test(url)) res.json({error: "invalid url"});
  else   
    createAndSaveUrl(url, (what, data) => {
      res.json({ original_url: data.originalUrl,  short_url:  data.shortUrl });
    });
  
});

app.get("/api/shorturl/:short", (req, res) => {
  findByShortUrl(req.params.short, (what, original) => {
    res.redirect(original);
  });
});
