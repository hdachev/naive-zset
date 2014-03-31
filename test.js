
var ZSet = require('./zset')
  , zset = new ZSet()
  , players = []
  , numPlayers = Math.round(Math.random() * 100000);

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
  throw "Rank is inconsistent.";

zset.test('done');
