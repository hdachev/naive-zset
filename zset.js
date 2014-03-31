

// naive sorted list impl
function ZSet() {
  this.$keys = [];
  this.$scores = {};
}

ZSet.prototype = {

  zadd: function(key, score) {
    if (typeof score !== 'number')
      throw new Error("Nan score.");
    if (typeof key !== 'string')
      throw new Error("Bad key");

    // remove existing
    var rank = this.zrank(key)
      , insertRank = this.$zrankForInsert(key, score);

    this.$scores[key] = score;

    if (rank >= 0) {
      if (insertRank > rank)
        insertRank --;
      if (rank !== insertRank)
        this.$move(key, rank, insertRank);

      return false;
    }

    this.$insert(key, insertRank);
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

, $insert: function(key, at) {
    this.$keys.splice(at, 0, key);
  }

, zrem: function(key) {
    var rank = this.zrank(key);
    if (rank < 0)
      return false;

    this.$keys.splice(rank, 1);
    delete this.$scores[key];
    return true;
  }


  // binary search related crap

, zrank: function(key) {
    var scores = this.$scores
      , keys = this.$keys
      , score = scores[key];

    // not in set
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
      if (rscore > score || (rscore === score && rkey > key))
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
      if (rscore > score || (rscore === score && rkey > key))
        hi = rank - 1;

      // go up
      else if (rscore < score || (rscore === score && rkey < key))
        lo = rank + 1;

      // found!
      else
        return rank;
    }

    return lo;
  }

};


//

module.exports = ZSet;
