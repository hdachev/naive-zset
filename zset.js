
function ZSet(descending, data) {
  this.$keys = [];
  this.$scores = {};
  this.$asc = !descending;

  if (data)
    this.setData(data);
}

ZSet.prototype = {

  zadd: function(key, score) {
    if (typeof score !== 'number')
      throw new Error("Nan score.");
    if (typeof key !== 'string')
      throw new Error("Bad key");

    var rank = this.zrank(key)
      , insertRank = this.$zrankForInsert(key, score);

    this.$scores[key] = score;

    // move stuff around the set if the key already exists,
    // if the key travels only over a short distance this should be fairly fast
    if (rank >= 0) {
      if (insertRank > rank)
        insertRank --;
      if (rank !== insertRank)
        this.$move(key, rank, insertRank);

      return false;
    }

    // else splice it in
    this.$keys.splice(insertRank, 0, key);
    return true;
  }

, zrem: function(key) {
    var rank = this.zrank(key);
    if (rank < 0)
      return false;

    this.$keys.splice(rank, 1);
    delete this.$scores[key];
    return true;
  }

, zcard: function() {
    return this.$keys.length;
  }

, zrange: function(a, b) {
    return this.$keys.slice(a, b);
  }

, zscore: function(key) {
    return this.$scores[key];
  }


  // moving stuff around

, $move: function(key, from, to) {
    var keys = this.$keys, pos;

    if (from > to)
      while (from > to) {
        pos = from - 1;
        keys[from] = keys[pos];
        from = pos;
      }

    else if (from < to)
      while (from < to) {
        pos = from + 1;
        keys[from] = keys[pos];
        from = pos;
      }

    else
      throw new Error("From/to are same.");

    // done!
    keys[to] = key;
  }


  // binary search related crap

, zrank: function(key) {
    var scores = this.$scores
      , keys = this.$keys
      , score = scores[key]
      , asc = this.$asc;
    // return -1 if not in the set
    if (!score && typeof score !== 'number')
      return -1;

    var lo = 0
      , hi = keys.length - 1
      , rank
      , rkey
      , rscore;

    while (hi > lo) {
      rank = Math.floor((lo + hi) / 2);
      rkey = keys[rank];

      // lucky
      if (rkey === key)
        return rank;

      // continue search
      rscore = scores[rkey];

      // we need to go down
      if (asc ? rscore > score || (rscore === score && rkey > key)
              : rscore < score || (rscore === score && rkey < key))
        hi = rank - 1;

      // we need to go up
      else
        lo = rank + 1;
    }

    if (keys[lo] !== key)
      throw new Error("Binsearch is broken, (" + lo + ") " + keys[lo] + " !== " + key);

    return lo;
  }

, $zrankForInsert: function(key, score) {
    var scores = this.$scores
      , keys = this.$keys
      , asc = this.$asc

      , lo = 0
      , hi = keys.length
      , rank
      , rkey
      , rscore;

    while (hi >= lo) {
      rank = Math.floor((lo + hi) / 2);
      rkey = keys[rank];
      rscore = scores[rkey];

      // go down
      if (asc ? rscore > score || (rscore === score && rkey > key)
              : rscore < score || (rscore === score && rkey < key))
        hi = rank - 1;

      // go up
      else if (asc ? rscore < score || (rscore === score && rkey < key)
                   : rscore > score || (rscore === score && rkey > key))
        lo = rank + 1;

      // found!
      else
        return rank;
    }

    return lo;
  }

, checkIntegrity: function(label) {
    var keys = this.$keys
      , scores = this.$scores
      , n = keys.length
      , i
      , lastKey, lastScore
      , key, score
      , asc = this.$asc;

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

      if (asc ? score > lastScore || (score === lastScore && key > lastKey)
              : score < lastScore || (score === lastScore && key < lastKey)) {
        lastKey = key;
        lastScore = score;
        continue;
      }

      throw new Error((label || "Ranking") || " - broken");
    }
  }


  // bulk set data
  // { key: score, key score }

, setData: function(scores) {
    var keys = []
      , asc = this.$asc
      , key;

    if (typeof scores !== 'object' || Array.isArray(scores))
      throw new Error("Bad dataset, provide your data as { key: score, ... }.");

    // collect the keyset and check scores
    for (key in scores) {
      score = scores[key];
      if (typeof score !== 'number')
        throw new Error("Nan score for key: " + key);

      keys.push(key);
    }

    if (asc)
      keys.sort(function(a, b) {
        return (scores[a] - scores[b])
            || (a < b ? -1 : a > b ? 1 : 0);
      });
    else
      keys.sort(function(b, a) {
        return (scores[a] - scores[b])
            || (a < b ? -1 : a > b ? 1 : 0);
      });

    this.$keys = keys;
    this.$scores = scores;
  }

};


//

module.exports = ZSet;
