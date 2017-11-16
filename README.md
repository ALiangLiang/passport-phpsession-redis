# passport-phpsession-redis

[Passport](http://passportjs.org/) strategy for authenticating with existing PHP session.

The module lets you authenticate using existing PHP session in your Node.js applications. By plugging into Passport, PHP session in redis authentication can be easily and unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-phpsession-redis
```

## Usage

#### Configure Strategy

The PHP session in redis authentication strategy authenticates users using a existing PHP session. The strategy best need redis connect information and session(or cookie) name.

```js
passport.use(new PhpsessionRedisStrategy({
    sessionName: 'PHPSESSID',
    redis: {
      host: '127.0.0.1'
      port: 6379,
      db: 0,
      prefix: 'PHPSESSID'
    }
  },
  function(session, done) {
    if (!sesssion) return done(new Error('No session found.'))
    var user = {
      userName: session.name,
    }
    return done(void 0, user)
  }
))
```

##### Available Options

This strategy takes an optional options hash before the function, e.g. `new PhpsessionRedisStrategy({/* options */, /* callback */})`.

The available options are:

* `sessionName` - Optional, defaults to 'username'
* `redis` - Optional object, pass this option to redis.createClient
[redis client refer](https://github.com/NodeRedis/node_redis/blob/master/README.md#rediscreateclient)

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'phpsession-redis'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.use((req, res, next) => {
    if(req.path !== '/login' && !req.isAuthenticated())
      return passport.authenticate('phpsession-redis', { failureRedirect: '/login' })(req, res, next)
    return next()
  })
```

## Credits

- [ALiangLiang](http://github.com/ALiangLiang)

## License

[The MIT License](http://opensource.org/licenses/MIT)
