node-browserid-session
======================

Framework implementation of user sign-in using:

- [BrowserID](https://browserid.org/) for email verification

- [HTML5 local storage](http://diveintohtml5.org/storage.html) for
  client-side session tracking

- [Express](http://expressjs.com/) as a [Node.js](http://nodejs.org/)
  web server

- [dnode](https://github.com/substack/dnode#readme) for RPC

- [Redis](http://redis.io/) for server side session persistence (and
  other storage)

Fork me and thrive!

To test
-------

    $ npm install
    $ node_modules/nedis/bin/nedis-server &
    $ node server.js

Then navigate to `http://localhost:9095` to run the sample web
application.
