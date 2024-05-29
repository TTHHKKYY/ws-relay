#!/usr/bin/env node
const http = require("http");
const ws = require("ws");

const http_server = http.createServer();
const ws_server = new ws.WebSocketServer({"server": http_server});

const rooms = {};

http_server.on("request",function(_,response)
{
	response.statusCode = 426;
	response.setHeader("Content-Type","text/plain");
	response.setHeader("Upgrade","websocket");
	response.end();
});

ws_server.on("connection",function(socket,request)
{
	const path = (new URL(`http://${process.env.HOST ?? "localhost"}${request.url}`)).pathname.split("/");
	const room_name = path[1];
	const password = path[2];
	
	if (!room_name || !password)
	{
		socket.close(1011,"Room name and password required");
		return;
	}
	
	let room = rooms[room_name];
	
	if (!room)
	{
		console.log("new room: " + room_name);
		room = {"password": password,"clients": []};
		rooms[room_name] = room;
	}
	
	if (password != room.password)
	{
		socket.close(1011,"Incorrect password");
		return;
	}
	
	room.clients.push(socket);
	
	socket.on("close",function()
	{
		room.clients.pop(room.clients.indexOf(socket));
		
		if (room.clients.length == 0)
		{
			console.log("empty room: " + room_name);
			delete rooms[room_name];
		}
	});
	
	socket.on("message",function(data,binary)
	{
		for (let i in room.clients)
		{
			if (room.clients[i] == socket) {continue;}
			room.clients[i].send(data,{
				"binary": binary
			});
		}
	});
});

console.log("ready");
http_server.listen(500);
