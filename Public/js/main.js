const socket = io()
const form = document.getElementById('chat-form')
const input = document.getElementById('msg')
const messages = document.querySelector('.chat-messages')


const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit("joinRoom", {username, room})

socket.on("roomUsers", ({room, users }) => {
    outputRoom(room)
    outputUsers(users)
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit("sendMessage", input.value.trim() )
    input.value = ""
})


socket.on('message', (msg) => {
    outputMessage(msg)  
    messages.scrollTop = messages.scrollHeight  
})


function outputMessage (message) {
    const div = document.createElement('div')
    div.classList.add('message');
    
    div.innerHTML = `
        <p class="meta"> ${message.username} <span>${message.time}</span></p>
        <p>${message.message}</p>
    `
    messages.appendChild(div)
}

function outputRoom(room) {
    const roomElement = document.getElementById('room-name')
    roomElement.innerText = room
}

function outputUsers(users) {
    const usersElement = document.getElementById('users')
    usersElement.innerHTML = users.map(user => `<li>${user.username}</li>`).join('')

}