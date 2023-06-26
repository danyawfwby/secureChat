from array import array
from flask import Flask, render_template, send_file, redirect, request, make_response, jsonify
import json
from flask_socketio import SocketIO
from flask_socketio import Namespace, emit


users = []

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

connectsList = {}

class Sockets(Namespace):
    def on_connect(this):
        global connectsList
        connectsList[request.sid] = this
        print(request.sid)

    def on_disconnect(this):
        global connectsList
        del connectsList[request.sid]

    def on_message(this, data):
        global connectsList
        connectsList[data["recipient"]].sendMessage(data["message"]["text"])

    def sendMessage(this, mess):
        emit('recieveMessage', mess, broadcast=False)

socketio.on_namespace(Sockets('/'))

# @socketio.on('message')
# def handle_message(data):
#     print(request.remote_addr)
#     print('received message: ' + data)
    # resp = make_response();

    # TOKEN = request.cookies.get("access_token")
    # hidden_users = request.cookies.get("hidden_users")
    # try:
    #     hidden_users = json.loads(hidden_users)
    # except:
    #     hidden_users = []

    # if(TOKEN):
    #     suggestions = VKAPI.friends.getSuggestions(TOKEN).response;
    #     if("response" in suggestions):
    #         suggestions = suggestions["response"]["items"];
    #         resp.data = render_template("pages/index.html", suggestions=suggestions, hidden_users=hidden_users);
    #     elif("error" in suggestions):
    #         resp.data = suggestions["error"]["error_msg"]
    # else:
    #     resp = redirect("/auth", 302)
    
    # return resp;


# @app.route("/json/getSuggestions", methods=["GET"])
# def get_familiars():
#     resp = make_response();
#     resp.mimetype='application/json; charset=utf-8';

#     TOKEN = request.cookies.get("access_token")
#     OFFSET = request.form.get("offset")
#     result = json.dumps({"error": "Unexpected error"})
#     suggestions = VKAPI.friends.getSuggestions(TOKEN, OFFSET).response;
#     if("response" in suggestions):
#         result = json.dumps(suggestions)
    
#     resp.data = result
    
#     return resp


# @app.route("/oneclick/add_friends", methods=["POST"])
# def add():
#     resp = make_response()
#     resp.mimetype='application/json; charset=utf-8';
    
#     TOKEN = request.cookies.get("access_token")
#     user_ids = request.form.get("user_ids")

#     added = []
#     result = json.dumps({"error": "Unexpected error"})
#     if(user_ids):
#         try:
#             user_ids = json.loads(user_ids)
#             for user_id in user_ids:
#                 status = VKAPI.friends.add(TOKEN, user_id).response;
#                 print(status)
#                 if("response" in status):
#                     added.append(user_id)
#                 elif("error" in status):
#                     result = json.dumps({"error": status["error"]["error_text"]});
#                     break;
#         except:
#             pass
#     resp.data = json.dumps(added) if len(added) else result

#     return resp;

    
if __name__ == "__main__":
    socketio.run(app)