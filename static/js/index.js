let openDialoge = null;
let newFavourite = null;
let sendMessage = null;

window.addEventListener("DOMContentLoaded", function(){

    class Database{
        constructor(){

        }

    }
    let interval = null;
    let ip = null;
    let note = null;
    const chatLeft = document.querySelector(".chat-left")
    const chatRight = document.querySelector(".chat-right")
    const openChatsA = document.querySelector(".openChats")
    const sendForm = document.querySelector(".send_form")
    const dialogeName = document.querySelector(".chat-info .dialoge")
    const chatBox = document.querySelector(".chat-box")
    const favouriteList = document.querySelector(".chat-left-favourite-list")
    const users = getUsersJSON();

    function showChat(){
        chatLeft.classList.toggle("mobile-hidden")
        chatLeft.classList.toggle("mobile-showed")
        chatRight.classList.toggle("mobile-hidden")
        chatRight.classList.toggle("mobile-showed")
        openChatsA.classList.toggle("opened")
    }

    function getUsersJSON(){
        return JSON.parse(localStorage.getItem("users") || "[]")
    }

    function setUsersJSON(arg){
        localStorage.setItem("users", JSON.stringify(arg))
    }

    function getMessagesJSON(){
        return JSON.parse(localStorage.getItem("messages") || "{}")
    }

    function setMessagesJSON(arg){
        localStorage.setItem("messages", JSON.stringify(arg))
    }

    function addMessageStorage(key, value, sender){
        const messJSON = getMessagesJSON()
        messJSON[key] || (messJSON[key] = [])
        messJSON[key].push({"sender": sender, "text": value})
        setMessagesJSON(messJSON)
    }
    function addUserStorage(ip, note){
        let users = getUsersJSON()
        users.push({"ip": ip, "note": note})
        setUsersJSON(users)
    }

    function addMessageBox(messBlock){
        chatBox.appendChild(messBlock);
        chatBox.scrollTop = chatBox.scrollHeight
    }

    function getHisMessDiv(name, text){
        const div = document.createElement("div")
        div.innerHTML = `<div class="sender-message message"><div class="name">${name}</div><div class="text">${text}</div></div>`
        return div
    }

    function getMineMessDiv(text){
        const name = "Я"
        const div = document.createElement("div")
        div.innerHTML = `<div class="mine-message message"><div class="name">${name}</div><div class="text">${text}</div></div>`
        return div
    }
    
    async function intervalFunc(){
        headers = {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}
        let messages = await xhrPromise('/get_messages', headers, "POST")
        if(messages.length){
            messages.forEach(function(e){
                addMessageStorage(ip, e, "notme")
                let mess = getHisMessDiv(note, e)
                addMessageBox(mess)
            })
        }
    }

    sendMessage = async function(e){
        e.preventDefault && e.preventDefault()
        let mess = new FormData(sendForm).get("text")
        const response = await xhrPromise("/send_message", {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}, "POST", `recipient=${ip}&text=${mess}`)
        if(response.status == "success"){
            mess = response.converted
            sendForm.querySelector("input").value = "";
            const messBlock = getMineMessDiv(mess);
            addMessageBox(messBlock)
            addMessageStorage(ip, mess, "me")
        }else alert(response.reason);
        return false;
    }

    function xhrPromise(url, headers, method = "GET", data = ""){
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true)
            for(const [key, value] of Object.entries(headers)){
                xhr.setRequestHeader(key, value);
            }
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) resolve(JSON.parse(this.response));
            }
            xhr.send(data);
        });
    }

    openDialoge = function(e){
        chatBox.innerHTML = ""
        showChat()
        clearInterval(interval)
        ip = e.querySelector(".ip").innerText
        note = e.querySelector(".note").innerText
        dialogeName.innerText = note || ip
        let messages = getMessagesJSON()
        typeof messages[ip] == "object" && messages[ip].forEach(function(e){
            if(e.sender == "me") chatBox.appendChild(getMineMessDiv(e.text));
            else chatBox.appendChild(getHisMessDiv(note, e.text));
        })
        chatBox.scrollTop = chatBox.scrollHeight
        interval = setInterval(intervalFunc, 1000)  
    }

    function aFavourite(ip, note = "Неизвестный"){
        const str = `<a class="chat-left-favourite" href="#" onclick="openDialoge(this)"><div class="ip">${ip}</div><div class="note">${note}</div></a>`
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(str, 'text/html');
        return htmlDoc.querySelector("a")
    }

    newFavourite = function(){
        const ip = prompt("Введите ip вашего собеседника")
        if(ip){
            const note = prompt("Введите псевдоним вашего собеседника")
            addUserStorage(ip, note)
            const a = aFavourite(ip, note)
            favouriteList.appendChild(a)
        }
    }

    openChatsA.addEventListener("click", function(e){
        e.preventDefault()
        showChat()
    })

    users.forEach(function(e){
        const a = aFavourite(e.ip, e.note)
        favouriteList.appendChild(a)
    })

    sendForm.addEventListener("submit", function(e){
        sendMessage(e)
    })
})
