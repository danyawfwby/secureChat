import array
from flask import Flask, render_template, send_file, redirect, request, make_response, jsonify
import json
import time
import html
import struct
import hashlib
import random
import asyncio

app = Flask(__name__)

class Users:
    def __init__(this) -> None:
        this.__users = {}

    def initUser(this, ip):
        this.__users[ip] = {"messages": [], "lastActive": time.time()}

    def getUser(this, ip):
        if ip in this.__users:
            return this.__users[ip]
    
    def getUsers(this):
        return this.__users
    
    def addMessage(this, ip, text):
        if ip in this.__users:
            if "messages" in this.__users[ip]:
                this.__users[ip]["messages"].append(text) 
    
    def getMessages(this, ip):
        if ip in this.__users:
            if "messages" in this.__users[ip]:
                return this.__users[ip]["messages"]
        return []

    def setOnline(this, ip):
        this.__users[ip]["lastActive"] = time.time()

users = Users()

def returnSleep(delay):
    time.sleep(delay)
    return True

def deleteEl(arr, key):
    if key in arr:
        del arr[key]

@app.route('/')
@app.route('/index')
def index():
    ip = request.remote_addr
    users.initUser(ip)
    return render_template("index.html", myip=ip)
    
@app.route("/send_message", methods=["POST"])
def sendMessage():
    response = {"status": "failed"}
    ip = request.form.get("recipient")
    text = request.form.get("text")

    if ip in users.getUsers():
        if text.strip():
            text = html.escape(text)
            users.getMessages(ip).append(text)
            response["status"] = "success"
            response["converted"] = text
        else:
            response["reason"] = "Сообщение не может быть пустым."
    else:
        response["reason"] = "Данный человек сейчас не в онлайне."
    
    return response

@app.route("/get_messages", methods=["POST"])
def getMessages():
    ip = request.remote_addr
    # return users.getMessages(ip)
    toReturn = users.getMessages(ip).copy()
    users.initUser(ip)
    return users.getUsers()

@app.route("/online", methods=["GET"])
def online():
    return str(len(users.getUsers()))

def onlineChecker(delay):
    while returnSleep(delay):
        usersClone = list(users.getUsers())
        for k, v in list(usersClone.items()):
            lastActive = v.get("lastActive")
            if(time.time()-30 > lastActive):
                print(f"Отключен пользователь {k} за долгое бездействие")
                deleteEl(users.getUsers(), k)

async def main():
    taskApp = asyncio.create_task(app.run(debug=True))
    taskChecker = asyncio.create_task(onlineChecker(3))
    await taskApp
    await taskChecker

    
if __name__ == "__main__":
    asyncio.run(main())


# def getId(ip):
#     randomId = random.randint(1000000, 9999999)
#     randomIdTime = int(time.time()*randomId)
#     stringId = f"{ip}{randomIdTime}"
#     encoded = str.encode(stringId)
#     return hashlib.sha256(encoded).hexdigest()
