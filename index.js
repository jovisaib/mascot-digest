const http = require('http');
const Twitter = require("twitter");
const config = require("./config.js");
const databaseUri = require("./database.js");
const { MongoClient } = require("mongodb");

const mdbClient = new MongoClient(databaseUri, { useNewUrlParser: true });
const twitterClient = new Twitter(config);
const params = { screen_name: 'mondomascots', exclude_replies: true, include_rts: false, tweet_mode: 'extended', count: 20 };

http.createServer((req, res) => {
    let last = "";

    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            let db = null;
            mdbClient.connect()
                .then(() => {
                    db = mdbClient.db("mascots");

                    tweets.forEach(t => {
                        let tweet = null;
                        if (t.entities.media && t.entities.media.length) {
                            tweet = t;
                            if (!last) {
                                last = t.entities.media[0].media_url_https;
                                console.log(last)
                            }
                        }

                        if (tweet) {
                            db.collection("mascots_raw").find({ id_str: t.id_str }, {}).count(function (err, amount) {
                                if (err) throw err;
                                if (amount >= 1) return

                                db.collection("mascots_raw").insertOne(tweet, function (err, res) {
                                    if (err) throw err;
                                });
                            });
                        }
                    })

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    var html = buildHtml(last);
                    res.end(html);
                })
                .catch(err => console.log(err));
        }
    });
}).listen();


function buildHtml(last) {
    return '<!DOCTYPE html>'
        + '<html><head>'
        + `<img src="${last}"></img>`
        + '</body></html>';
};