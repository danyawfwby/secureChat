from array import array
from flask import Flask, render_template, send_file, redirect, request, make_response, jsonify
import json
import time
import struct
import hashlib
import random
import asyncio

app = Flask(__name__)

class stackableDict:
    def __init__(this) -> None:
        this.__dict = {}
        this.__stack = []

    def __amIFirst(this, arg):
         if(len(this.__stack)):
            return id(this.__stack[0]) == arg

    async def stack(this, func, *args):
        data = (func, args)
        this.__stack.append(data)
        while not this.__amIFirst(id(data)):
            await time.sleep(5)
        result = func(*args)
        del this.__stack[0]
        return result
    
    def __get(this, key):
        if key in this.__dict:
            return this.__dict[key]
        else: 
            return None
    
    async def get(this, key):
        return await asyncio.create_task(this.stack(this.__get, key))
    
    def __getAll(this):
        return this.__dict.copy()

    async def getAll(this):
        return await asyncio.create_task(this.stack(this.__getAll))
        return await t
    
    def __add(this, key, value):
        this.__dict[key] = value

    async def add(this, key, value):
        return await asyncio.create_task(this.stack(this.__add, key, value))

    def __delete(this, key):
        del this.__dict[key]

    async def delete(this, key):
        return await asyncio.create_task(this.stack(this.__delete, key))

dict1 = stackableDict()

async def server():
    global dict1
    for i in range(100):
        await dict1.add("test", i)

async def checker():
    global dict1
    print( await dict1.getAll())

async def main():
    t1 = asyncio.create_task(server())
    t2 = asyncio.create_task(checker())
    


asyncio.run(main())

# onliners = stackableDict()
# messages = stackableDict()

# def getId(ip):
#     randomId = random.randint(1000000, 9999999)
#     randomIdTime = int(time.time()*randomId)
#     stringId = f"{ip}{randomIdTime}"
#     encoded = str.encode(stringId)
#     return hashlib.sha256(encoded).hexdigest()

# def setOnline(ip):
#     global onliners
#     onliners.add(ip, {"lastActive": time.time()})

# @app.route('/')
# @app.route('/index')
# def index():
#     ip = request.remote_addr
#     setOnline(ip)
#     return render_template("index.html")
    
# @app.route("/send_message", methods=["POST"])
# def sendMessage():
#     response = {"status": "failed"}
#     messages.add(ip, [])
#     ip = request.form.get("recipient")
#     if ip in messages.getAll():
#         text = request.form.get("text")
#         messages.get(ip).append(text)
#         response["status"] = "success"
#     return response

# @app.route("/get_messages", methods=["POST"])
# def getMessages():
#     ip = request.remote_addr
#     setOnline(ip)
#     toReturn = messages.get(ip)
#     messages.add(ip, [])
#     return toReturn

# @app.route("/online", methods=["GET"])
# def online():
#     return str(len(onliners.getAll()))

# def onlineChecker(delay):
#     while True:
#         time.sleep(delay)
#         onlinersClone = onliners.getAll()
#         for k, v in list(onlinersClone.items()):
#                 lastActive = v.get("lastActive")
#                 if(time.time()-30 > lastActive):
#                     print(f"Отключен пользователь {k} за долгое бездействие")
#                     onliners.delete(k)
#                     if k in messages.getAll():
#                         messages.delete(k)

# async def main():
#     taskApp = asyncio.create_task(app.run(debug=True))
#     taskChecker = asyncio.create_task(onlineChecker(3))
#     await taskApp
#     await taskChecker

    
# if __name__ == "__main__":
#     asyncio.run(main())