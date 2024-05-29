#!/usr/bin/env node
const ws = require("ws");

const room_name = process.argv[2];
const password = process.argv[3];

if (!room_name || !password)
{
	console.log("client: room_name password");
	return;
}

const client = new ws.WebSocket(`ws://localhost:500/${room_name}/${password}`);

console.log(client.url);

client.on("open",function()
{
	setInterval(function()
	{
		client.send("true\n");
	},750)
});
