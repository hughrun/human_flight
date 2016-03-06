// Human Flight Bot
// Hugh Rundle 2016

// Create a simple server to keep the bot running
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Human Flight Bot\n');
}).listen(3031);

// require twit and random-js
var Twit = require('twit');
var random = require('random-js')();

var T = new Twit({
    consumer_key:         '...'
  , consumer_secret:      '...'
  , access_token:         '...'
  , access_token_secret:  '...'
})
// make sure we have a real ID from a recent tweet initially, otherwise the bot won't run at all.
var lastTweet = '688488808958984200';

// function to update the last tweet so we don't keep spamming the same people.
// we call this later.
function updateLatest(t) {
	lastTweet = t;
}

// define some functions for sending tweets - we'll call one randomly if there are any offending tweets to respond to.
function prefTerm(u) {
	T.post('statuses/update', { status: 'Hi @' + u + ' NASA calls it "human space flight": http://spaceflight.nasa.gov/home/index.html' }, function(err, data, response) {
		if (err) {
			console.log(err)
		}
	});	
}

function tryUsing(u) {
	T.post('statuses/update', { status: 'Hey there @' + u + ' next time, try using "human flight": http://spaceflight.nasa.gov/home/index.html' }, function(err, data, response) {
		if (err) {
			console.log(err)
		}
	});			
}

function valentina(u) {
	T.post('statuses/update', { status: 'Hi @' + u + ' Valentina Tereshkova went to space in 1963. https://en.wikipedia.org/wiki/Valentina_Tereshkova Next time try "crewed".' }, function(err, data, response) {
		if (err) {
			console.log(err)
		}
	});			
}

function outdated(u) {
	T.post('statuses/update', { status: 'Nice tweet @' + u + ' but "manned" is a little outdated - next time try "piloted".' }, function(err, data, response) {
		if (err) {
			console.log(err)
		}
	});			
}

// Set timeout to loop the whole thing every 17 minutes
var timerVar = setInterval (function () {checkFlights()}, 1.02e+6);


// Run the bot when the timer expires
function checkFlights() {
	// Search Twitter for the most recent 3 tweets matching 'manned AND flight' that have been posted since the last time we checked.
	// Ignore anything in URLs, hashtags, embedded tweets etc ('entitites')
	T.get('search/tweets', { q: "manned flight", count: 3, since_id: lastTweet, include_entities: false }, function(err, data, response) {
		// for each tweet that comes back in the search results...
		for (var y in data.statuses){
			var tweet = data.statuses[y];
			// get the id of the tweet
			var twId = tweet.id;
			// get user screen name
			var user = tweet.user.screen_name;
			// don't reply to yourself (it will go on forever)!
			// don't respond to the same tweet over and over - lasTweet shouldn't be in our results but sometimes is
			// ...possibly because it's been 'favorited'?
			// don't respond to retweets or quoted tweets
			if (user != 'flight_bot' && lastTweet != twId && tweet.retweeted_status == null && tweet.quoted_status == null) {
				// pick a message at random and trigger the associated function to tweet it
				var phrase = random.integer(1,4);
				if (phrase == 1) {
					prefTerm(user);
				}
				if (phrase == 2) {
					tryUsing(user);
				}
				if (phrase == 3) {
					valentina(user);
				}
				if (phrase == 4) {
					outdated(user);
				}
				// if the tweet ID is bigger (i.e. later) than the last known tweet, update the counter.
				if (twId > lastTweet) {
					updateLatest(twId);
				}
			}
		};
	});
	var time = new Date().toISOString();
	console.log('finished loop at ' + time);
	console.log('lastTweet is currently ' + lastTweet);
}

