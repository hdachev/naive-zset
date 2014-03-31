
var ZSet = require('./zset')
  , zset = new ZSet()
  , players = []
  , MAX_SCORE = 100000
  , numPlayers = Math.round(Math.random() * MAX_SCORE);


ZSet.prototype.test = function(label) {
  var keys = this.$keys
    , scores = this.$scores
    , n = keys.length
    , i
    , lastKey, lastScore
    , key, score;

  if (n < 1)
    return;

  lastKey = keys[0];
  lastScore = scores[lastKey];

  for (i = 1; i < n; i++) {
    key = keys[i];
    score = scores[key];

    if (typeof score !== 'number')
      throw new Error("corrupt score: " + score);
    if (typeof lastScore !== 'number')
      throw new Error("corrupt lastScore: " + lastScore);

    if (score > lastScore || (score === lastScore && key > lastKey)) {
      lastKey = key;
      lastScore = score;
      continue;
    }

    throw new Error((label || "Ranking") || " - broken");
  }
};


for (var i = 0; i < numPlayers; i ++)
  players[i] = { key: 'player_' + i, score: Math.round(Math.random() * 100) };

var first = players[0].key
  , firstScore = players[0].score;

players.forEach(function(player) {
  if (!zset.zadd(player.key, player.score))
    throw "Already existing.";
});

zset.test('init');

if (zset.zcard() !== numPlayers)
  throw "Bad card.";

var rank = zset.zrank(first);
if (rank < 0)
  throw "Player not there: " + rank;

if (zset.zscore(first) !== firstScore)
  throw "Scores got mixed up.";
if (!zset.zrem(first))
  throw "Player can't be removed.";
if (zset.zrank(first) >= 0)
  throw "Player remained in set.";

zset.test('rem1');

if (zset.zrem(first))
  throw "Player removed twice.";

zset.test('rem2');

if (!zset.zadd(first, 0))
  throw "Player couldn't be added.";

zset.test('re-add1');

if (zset.zadd(first, firstScore))
  throw "Player added twice.";

zset.test('re-add2');

if (zset.zrank(first) !== rank)
  throw "Rank is off 1.";

if (zset.zadd(first, MAX_SCORE + 1))
  throw "Player added twice.";

zset.test('re-add3');

if (zset.zrank(first) !== zset.$keys.length - 1)
  throw "Rank is off."

if (zset.zadd(first, firstScore))
  throw "Player added twice.";

zset.test('re-add4');

if (zset.zrank(first) !== rank)
  throw "Rank is off 2.";

zset.test('done');
