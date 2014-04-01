
var ZSet = require('./zset');


//

function test(desc, numPlayers, maxScore) {
  var players = []
    , zset = new ZSet(desc);

  for (var i = 0; i < numPlayers; i ++)
    players[i] = { key: 'player_' + i, score: Math.round(Math.random() * maxScore) };

  var first = players[0].key
    , firstScore = players[0].score;

  players.forEach(function(player) {
    if (!zset.zadd(player.key, player.score))
      throw "Already existing.";
  });

  zset.checkIntegrity('init');

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

  zset.checkIntegrity('rem1');

  if (zset.zrem(first))
    throw "Player removed twice.";

  zset.checkIntegrity('rem2');

  if (!zset.zadd(first, 0))
    throw "Player couldn't be added.";

  zset.checkIntegrity('re-add1');

  if (zset.zrank(first) !== (desc ? numPlayers - 1 : 0))
    throw "Rank is off 0."

  if (zset.zadd(first, firstScore))
    throw "Player added twice.";

  zset.checkIntegrity('re-add2');

  if (zset.zrank(first) !== rank)
    throw "Rank is off 1.";

  if (zset.zadd(first, maxScore + 1))
    throw "Player added twice.";

  zset.checkIntegrity('re-add3');

  if (zset.zrank(first) !== (desc ? 0 : numPlayers - 1))
    throw "Rank is off 2."

  if (zset.zadd(first, firstScore))
    throw "Player added twice.";

  zset.checkIntegrity('re-add4');

  if (zset.zrank(first) !== rank)
    throw "Rank is off 3.";

  zset.checkIntegrity('done');

}


//

test(false, Math.ceil(Math.random() * 1000), 100);
test(true,  Math.ceil(Math.random() * 1000), 100);
test(false, Math.ceil(Math.random() * 100), 1000);
test(true,  Math.ceil(Math.random() * 100), 1000);
test(false, Math.ceil(Math.random() * 10), 10000);
test(true,  Math.ceil(Math.random() * 10), 10000);


//

console.log("OK!");
