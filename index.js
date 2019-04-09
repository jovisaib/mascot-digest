const http = require('http');
const Twitter = require("twitter");
const config = require("./config.js");
const databaseUri = require("./database.js");
const { MongoClient } = require("mongodb");

const mdbClient = new MongoClient(databaseUri, { useNewUrlParser: true });
const twitterClient = new Twitter(config);
const params = { screen_name: 'mondomascots', exclude_replies: true, count: 1, include_rts: false };


http.createServer((req, res) => {
    let last = "";

    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            tweets.forEach(t => {
                last = t.entities.media[0].media_url_https;

                mdbClient.connect()
                    .then(() => {
                        mdbClient.db("mascots").collection("mascots_raw").insertOne(t, function (err, res) {
                            if (err) throw err;
                        });
                        console.log("MASCOT ", last);
                    })
                    .catch(err => console.log(err));
            })
            res.writeHead(200, { 'Content-Type': 'text/html' });
            var html = buildHtml(last);
            res.end(html);
        }
    });


}).listen(8081);


function buildHtml(last) {
    return '<!DOCTYPE html>'
        + '<html><head>'
        + `<img src="${last}"></img>`
        + '</body></html>';
};