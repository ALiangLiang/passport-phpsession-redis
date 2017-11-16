/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , util = require('util')
  , redis = require('redis')
  , unserialize = require('php-serialization').unserialize


/**
 * `Strategy` constructor.
 *
 * The PHP session in redis authentication strategy authenticates requests based on the
 * session in redis server.
 *
 * Examples:
 *
 *     passport.use(new PhpsessionRedisStrategy({
 *         sessionName: 'PHPSESSID',
 *         completelyLogout: false,
 *         redis: {
 *           host: '127.0.0.1'
 *           port: 6379,
 *           db: 0,
 *           prefix: 'PHPSESSID'
 *         }
 *       },
 *       function(session, done) {
 *         if (!sesssion) return done(new Error('No session found.'))
 *         var user = {
 *           userName: session.name,
 *         }
 *         return done(void 0, user)
 *       }
 *     ))
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options
    options = {}
  }

  var sessionName = options.phpsessionName || options.sessionName || 'PHPSESSID'
    , completelyLogout = options.completelyLogout || false
  if (!options.redis) options.redis = {}
  options.redis.prefix = options.redis.prefix || 'PHPREDIS_SESSION:'
  options.redis.host = options.redis.host || '127.0.0.1'
  options.redis.port = options.redis.port || 6379
  options.redis.db = options.redis.db || 0

  passport.Strategy.call(this)
  this.name = 'phpsession-redis'
  this._verify = verify
  this._sessionName = sessionName
  this._passReqToCallback = options.passReqToCallback
  this._redisClient = redis.createClient(options.redis)
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy)

/**
 * Authenticate request based on the contents of a hash link.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  var self = this
  var sessionId = req.cookies[this._sessionName]
  if(!sessionId)
    return self.fail('PHP session not found, maybe not login yet.')

  this._redisClient.get(sessionId, function (err, result) {
    if (err) throw err
    if (!result) return self.fail('PHP session not found, maybe not login yet.')

    var sessionObj = unserialize(result.replace(/.*?\|/, ''))
    var session = {}
    Object.keys(sessionObj.__attr__)
      .forEach((key) => session[key] = sessionObj.__attr__[key].val)

    var verified = function(err, user, info) {
      if (err) { return this.error(err) }
      if (!user) { return this.fail(info) }
      this.success(user, info)
      next()
    }.bind(self)

    if (self._verify){
      if (self._passReqToCallback) {
        self._verify(req, session, verified)
      } else {
        self._verify(session, verified)
      }
    } else {
      self.success(session)
    }
  })
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy
