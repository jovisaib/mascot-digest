const http = require('http');
const Twitter = require("twitter");
const config = require("./config.js");

const client = new Twitter(config);
const params = { screen_name: 'mondomascots', exclude_replies: true, count: 1 };

let last = "";

let getMascotStatus = () => {
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log("SUCCESS!")
            tweets.forEach(t => {
                last = t.entities.media[0].media_url_https;
                console.log(last)
            })
        }
    });
}

getMascotStatus();
setInterval(getMascotStatus, 1000 * 60 * 15);

http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    var html = buildHtml(req);
    res.end(html);
}).listen(8080);


function buildHtml(req) {
    return '<!DOCTYPE html>'
        + '<html><head>' +

        `<img src="${last}"></img>`

        + '</body></html>';
};