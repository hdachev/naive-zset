
var ZSet = require('./zset');

function test(desc, numPlayers, maxScore) {
  var players = []
    , zset = new ZSet(desc);

  for (var i = 0; i < numPlayers; i ++)
    players[i] = { key: 'player_' + i, score: Math.round(Math.random() * maxScore) };

  var first = players[0].key
    , firstScore = players[0].score;

  // test adding one by one
  players.forEach(function(player) {
    if (!zset.zadd(player.key, player.score))
      throw "Already existing.";
  });

  zset.checkIntegrity('init -a');

  if (zset.zcard() !== numPlayers)
    throw "Bad card -a";

  // test adding bulk setting
  var bulkData = {};
  players.forEach(function(player) {
    bulkData[player.key] = player.score;
  });

  zset.setData(bulkData);
  zset.checkIntegrity('init -b');

  if (zset.zcard() !== numPlayers)
    throw "Bad card -b";

  // test moving stuff around
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
    throw "Rank is off 0.";

  if (zset.zadd(first, firstScore))
    throw "Player added twice.";

  zset.checkIntegrity('re-add2');

  if (zset.zrank(first) !== rank)
    throw "Rank is off 1.";

  if (zset.zadd(first, maxScore + 1))
    throw "Player added twice.";

  zset.checkIntegrity('re-add3');

  if (zset.zrank(first) !== (desc ? 0 : numPlayers - 1))
    throw "Rank is off 2.";

  if (zset.zadd(first, firstScore))
    throw "Player added twice.";

  zset.checkIntegrity('re-add4');

  if (zset.zrank(first) !== rank)
    throw "Rank is off 3.";

  // shuffle the set a couple of times
  function shuffle() {
    players.forEach(function(player) {
      if (Math.random() > 0.66)
        zset.zrem(player.key);
      else if (Math.random() > 0.33)
        zset.zadd(player.key, Math.random() * maxScore);
      else
        zset.zadd(player.key, Math.round(Math.random() * maxScore));

      if (Math.random() > 0.9)
        zset.checkIntegrity('randcheck');
    });
  }

  shuffle();
  shuffle();
  shuffle();

  zset.checkIntegrity('shuffle');
}

// spam with various dataset sizes
test(false, 1, 1);
test(true,  1, 1);
test(false, 2, 2);
test(true,  2, 2);
test(false, 3, 3);
test(true,  3, 3);
test(false, 4, 4);
test(true,  4, 4);
test(false, 5, 5);
test(true,  5, 5);
test(false, Math.ceil(Math.random() * 10), 10000);
test(true,  Math.ceil(Math.random() * 10), 10000);
test(false, Math.ceil(Math.random() * 100), 1000);
test(true,  Math.ceil(Math.random() * 100), 1000);
test(false, Math.ceil(Math.random() * 1000), 100);
test(true,  Math.ceil(Math.random() * 1000), 100);
test(false, Math.ceil(Math.random() * 10000), 10);
test(true,  Math.ceil(Math.random() * 10000), 10);

// should be good!
console.log("Looks good.");
