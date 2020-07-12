const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const { formatMessage } = require('./utils/formatMessage')
const { userJoin, getCurrentUser, userLeaves, getAllUsersInRoom } = require('./utils/users') 


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "Public")))

const botName = "ChatU Bot"

// on connection event 
io.on('connection', socket => {
    socket.on("joinRoom", ({ username, room}) => {
       const user = userJoin(socket.id, username, room)
       
        socket.join(user.room)
        
        socket.emit('message', formatMessage(botName, 'Welcome to ChatU'))
        socket.broadcast.to(user.room).emit('message', formatMessage( botName, `${user.username} joined the room`))

        // tell the user room the players in them
        io.to(user.room).emit("roomUsers", {room: user.room, users: getAllUsersInRoom(user.room)})
        
        socket.on("sendMessage", message => {
            const user = getCurrentUser(socket.id)
            io.to(user.room).emit('message', formatMessage(user.username, message))
        })
        
        socket.on("disconnect", () => {
            const user = userLeaves(socket.id)
            if(user){
                io.to(user.room).emit('message', formatMessage(  botName, `${user.username} left the room`))
                io.to(user.room).emit("roomUsers", {room: user.room, users: getAllUsersInRoom(user.room)})
            }
    })

    } )


})

const PORT = 1200

server.listen(PORT, console.log('Server running on port %s', PORT))