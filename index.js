const http = require('http');
const config = require("./config.js");
const databaseUri = require("./database.js");
const Twitter = require("twitter");
const { MongoClient } = require("mongodb");

const mdbClient = new MongoClient(databaseUri, { useNewUrlParser: true });
const twitterClient = new Twitter(config);
const params = { screen_name: 'mondomascots', exclude_replies: true, count: 1 };
let last = "";
let db = null;

let connectToMongo = () => {
    return mdbClient.connect();
}


let getMascotStatus = () => {
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            tweets.forEach(t => {
                last = t.entities.media[0].media_url_https;
                db.collection("mascots_raw").insertOne(t, function(err, res) {
                    if (err) throw err;
                    console.log("MASCOT: ", last);
                });
            })
        }
    });
}

http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    var html = buildHtml(req);
    res.end(html);
}).listen(8080);


connectToMongo()
    .then(()=>{
        db = mdbClient.db("mascots");
        getMascotStatus();
        setInterval(getMascotStatus, 1000 * 60 * 15);
    })
    .catch(err => console.log(err));


function buildHtml(req) {
    return '<!DOCTYPE html>'
        + '<html><head>'
        + `<img src="${last}"></img>`
        + '</body></html>';
};