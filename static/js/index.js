let openDialoge = null;
let newFavourite = null;
let sendMessage = null;
window.addEventListener("DOMContentLoaded", function(){

    let interval = null;
    let ip = null;
    let note = null;
    const sendForm = document.querySelector(".send_form")
    const dialogeName = document.querySelector(".chat-info .dialoge")
    const chatBox = document.querySelector(".chat-box")
    const favouriteList = document.querySelector(".chat-left-favourite-list")

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
            let mess = getHisMessDiv(note, e)
            chatBox.appendChild(mess)
        })
    }
    sendMessage = async function(e){
        console.log(e)
        e.preventDefault && e.preventDefault()
        const formData = new FormData(sendForm)
        const mess = formData.get("text")
        await xhrPromise("/send_message", {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}, "POST", `recipient=${ip}&text=${mess}`)
        sendForm.querySelector("input").value = ""
        return false;
    }
    sendForm.addEventListener("submit", function(e){
        sendMessage(e)
    })

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
        clearInterval(interval)
        ip = e.querySelector(".ip").innerText
        note = e.querySelector(".note").innerText
        dialogeName.innerText = note
        interval = setInterval(intervalFunc, 5000)    
    }

    function aFavourite(ip, note = "Неизвестный"){
        const a = document.createElement("a")
        a.innerHTML = `<a class="chat-left-favourite" href="#" onclick="openDialoge(this)"><div class="ip">${ip}</div><div class="note">${note}</div></a>`
        return a
    }

    newFavourite = function(){
        const ip = prompt("Введите ip вашего собеседника")
        if(ip){
            const a = aFavourite(ip)
            favouriteList.appendChild(a)
        }
    }
    
})
