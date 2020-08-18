const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const app = express()
const sanitizeHTML = require('sanitize-html')

let sessionOptions = session({
    secret: "JavaScript is so cool",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

//Sessions
app.use(sessionOptions)
//flash messages
app.use(flash())

app.use(function(req, res, next){

    //make our markdown function available within ejs templates
    res.locals.filterUserHtml = function(content){
            return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
    }
    //make all error and sucess flash message avail on all temp

    res.locals.errors = req.flash("errors")
    res.locals.success  = req.flash("success")
    
    //make current user id avail on the req obj

    if(req.session.user){req.visitorId = req.session.user._id}else{req.visitorId = 0}
    //make users session data avail from view templates
    res.locals.user = req.session.user
    next()
})

//Used to handle get and post requests
const router = require('./router')

//Tells express to add user submitted data to req object
app.use(express.urlencoded({extended: false}))
//Send over using json
app.use(express.json())


//Include folder that is only visible to coder
app.use(express.static('public'))
//Use this property when you want to render a view from another folder, the 1st property needs views
app.set('views', 'views')
//Which template engine we using? ejs
app.set('view engine', 'ejs')

//Use new router we setup
app.use(/*Base url*/'/', router)

const server  = require('http').createServer(app)

const io = require('socket.io')(server)

io.use(function(socket, next){
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket){
  if(socket.request.session.user){
  let user = socket.request.session.user

  socket.emit("welcome", {username: user.username, avatar: user.avatar})

    socket.on('chatMessageFromBrowser', function(data){
        socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
    })
  }
})

module.exports = server

