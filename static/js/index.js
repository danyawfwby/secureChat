let openDialoge = null;
let newFavourite = null;
let sendMessage = null;
window.addEventListener("DOMContentLoaded", function(){


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
        chatRight.classList.toggle("mobile-hidden")
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
        messages && messages.forEach(function(e){
            let messJSON = getMessagesJSON()
            messJSON[ip] || (messmessJSONages[ip] = [])
            messJSON[ip].push({"sender": "notme", "text": e})
            setMessagesJSON(messJSON)
            let mess = getHisMessDiv(note, e)
            chatBox.appendChild(mess)
        })
    }
    sendMessage = async function(e){
        e.preventDefault && e.preventDefault()
        const formData = new FormData(sendForm)
        const mess = formData.get("text")
        const response = await xhrPromise("/send_message", {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}, "POST", `recipient=${ip}&text=${mess}`)
        if(response.status == "success"){
            sendForm.querySelector("input").value = "";
            const messBlock = getMineMessDiv(mess);
            chatBox.appendChild(messBlock);
            let messages = getMessagesJSON()
            messages[ip] || (messages[ip] = [])
            messages[ip].push({"sender": "me", "text": mess})
            setMessagesJSON(messages)
        }else alert(response.reason);
        return false;
    }

    function xhrPromise(url, headers, method = "GET", data = ""){
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true)
            Object.entries(headers).forEach(function(k){
                let header = k[0];
                let value = k[1];
                xhr.setRequestHeader(header, value);
            })
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
        dialogeName.innerText = note
        let messages = getMessagesJSON()
        if(messages[ip]){
            Object.entries(messages[ip]).forEach(function(a, b, c){
                if(a[1].sender == "me") chatBox.appendChild(getMineMessDiv(a[1].text));
                else chatBox.appendChild(getHisMessDiv(note, a[1].text));
            })
        }
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
            let users = getUsersJSON()
            users.push({"ip": ip, "note": note})
            setUsersJSON(users)
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
