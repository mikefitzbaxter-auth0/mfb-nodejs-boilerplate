
/* ###### INCLUDES ###### */
const dotenv	   = require('dotenv').config()
const express      = require('express')
const nunjucks     = require('nunjucks')
const helmet       = require('helmet')
const logger       = require('morgan')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const compression  = require('compression')
const session	   = require('express-session')

const app 	= express()
const http  = require('http')

/** Create HTTP server **/
const server = http.createServer(app)
/** Create Socket IO instance **/
// const io = require('socket.io')(server)

/* ###### TEMPLATE CONFIG ###### */
// configure nunjucks template engine
// http://mozilla.github.io/nunjucks
const env = nunjucks.configure('views', {
	autoescape: true,
	express: app,
	watch: true
})
env.addGlobal('app', { 
	title: process.env.APP_TITLE,
	ga: process.env.GA,
	env: app.get('env'),
})

/* ###### SESSION CONFIG ###### */
const sess = {
	secret: process.env.APP_SECRET, // configured in .env
	cookie: {},
	resave: false,
	saveUninitialized: false
}
if (app.get('env') === 'production') {
	// sess.cookie.secure = true // serve secure cookies, requires https
}

/* ###### MIDDLEWARE ###### */
app.use(helmet()) // protect app by setting various http headers
app.use(logger('dev')) // morgan logger for http
app.use(bodyParser.json()) // parse json body
app.use(bodyParser.urlencoded({ extended: false })) //urlencode parsed body
app.use(session(sess)) // use sessions middleware
app.use(cookieParser()) // parse cookies
app.use(compression()) // gzip compression all routes
app.use(express.static(__dirname + '/dist')) // static files middleware

/* ###### PASSPORT & AUTH CONFIG ###### */
// only enable if Auth0 Config is available
if (process.env.AUTH0_CLIENT) {
	const auth0 = require('./middleware/auth0')
	auth0(app)
}


/* ###### ROUTING ###### */
const api = require('./routes/api')
const index = require('./routes/index')

// site url sections
app.use('/', index)
app.use('/api', api)


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found')
	err.status = 404
	next(err)
})

/* ###### ERROR HANDLERS ###### */
app.use(function(err, req, res, next) {
	// Set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	res.status(err.status || 500)

	if (err.status === 404) {
		res.render('404.html')
	} else {
		res.json({message: err.message, error: err})
	}
});

// export app to ./bin/www
module.exports = {
	'server': server,
	'name'  : process.env.APP_NAME
}