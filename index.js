const http = require('http');
const Twitter = require("twitter");
const config = require("./config.js");
const databaseUri = require("./database.js");
const { MongoClient } = require("mongodb");

const mdbClient = new MongoClient(databaseUri, { useNewUrlParser: true });
const twitterClient = new Twitter(config);
const params = { screen_name: 'mondomascots', exclude_replies: true, include_rts: false, count: 1 };


http.createServer((req, res) => {
    let last = "";

    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        let tweet = null;
        if (!error) {
            tweets.forEach(t => {
                if (t.entities.media && t.entities.media.length) {
                    tweet = t;
                    last = t.entities.media[0].media_url_https;
                }
            })

            if (tweet) {
                mdbClient.connect()
                    .then(() => {
                        mdbClient.db("mascots").collection("mascots_raw").insertOne(tweet, function (err, res) {
                            if (err) throw err;
                        });
                        console.log("MASCOT ", last);
                    })
                    .catch(err => console.log(err));
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            var html = buildHtml(last);
            res.end(html);
        }
    });
}).listen();


function buildHtml(last) {
    return '<!DOCTYPE html>'
        + '<html><head>'
        + `<img src="${last}"></img>`
        + '</body></html>';
};