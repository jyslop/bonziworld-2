var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors')

app.use(cors());
const blacklist = [
  "<script>",
  "<a href='javascript:",
  '<a href="javascript:',
  "<a",
  "<video",
  "<img",
  "<img",
  "<audio",
  " onclick='",
  " onmouseover='",
  
  "();",
  ".emit",
  "function()",
  "function ()",
  "() =>",
];

function Idgen(length) {
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';let result = '';
   for (let i = 0; i < length; i++){
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}
 
app.use(express.static('public'));
app.use('/img', express.static(__dirname + '/public/img'));
http.listen(process.env.PORT || 3000, function() {
  var host = http.address().address
  var port = http.address().port
  console.log('BonziWORLD XP is listening at port %s' + '!', port)
});
let config = {
	rateLimit:800,
	godword:"wewuzchatascoloredmonkeyznsheit",
	rooms:{
		idLength:50,
		nameLength:30
	},
	imageWhitelist:['https://files.catbox.moe','https://wikipedia.org','https://i.ibb.co'],
	commands:{
		"color":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){
				
				if(!config.imageWhitelist.some(r => eventData.startsWith(r)) && !colorNames.includes(eventData))return;
				if(colorNames.includes(eventData))eventData=colorList[eventData];
				let roomUsers = getUsers(thisSocket.user.roomId);
				let publicUser = getUsers(thisSocket.user.roomId)[thisSocket.user.roomIndex];
				
				thisSocket.user = updateUser(thisSocket.user,{color:eventData},true);
				return thisSocket.user;
			}
		},
		"asshole":(thisSocket,eventData)=>{
			eventData = {to:eventData};
			console.log(eventData);
			if(typeof eventData == "object"){
				console.log({by:thisSocket.user.id,to:blankify(eventData.to)});
				eventRoom("asshole",{by:thisSocket.user.id,to:blankify(eventData.to)},thisSocket.user,true);
			}
		}
	}
};
var godword = "wewuzchatascoloredmonkeyznsheit"
var colorList = {
  "red":"/img/bonzi/red.png",
  "green":"/img/bonzi/green.png",
  "blue":"/img/bonzi/blue.png",
  "purple":"/img/bonzi/purple.png",
  "pink":"/img/bonzi/pink.png",
  "black":"/img/bonzi/black.png",
  "brown":"/img/bonzi/brown.png",
  "bcn":"/img/bonzi/bcn.png",
  "smile":"/img/bonzi/smile.png",
};
let colorNames = Object.keys(colorList);
var botmsg = [
"- hi",'- "me jew"',"UTTP is full of pedophiles, BIA will bring the UTTP to a slow and painful death by 2027"];

var publicrooms ={ "default":{ 
   users: [
    {name: "BonziBUDDY<br> <i style='color:purple;'>(ыки)</i>", color: "/img/bonzi/purple.png", id: "bonzibuddy", pitch: 80, speed: 150, messages: [],socketId:"bonziBuddy"}
  ]
}};
let skiddieWatch = {};

setInterval(() => {
  var tosend = botmsg[Math.floor(Math.random() * botmsg.length)];
  io.emit("msg", {
    msg: tosend,
    id: "bonzibuddy"
  });
}, 120000);
setInterval(() => {
	Object.keys(skiddieWatch).forEach(ipAddress => {
		let currentUser = skiddieWatch[ipAddress];
		if(currentUser.lastLogged < 90000)currentUser.lastLogged+=100;
	});
},100);
function blankify(txt,limiter=1024){
	blacklist.forEach(blacklistContent => {
		txt = txt.replaceAll(blacklistContent,"");
	});
	return txt.substring(0,limiter);
}
function getUsers(roomId){
	let result = [];
	publicrooms[roomId].users.forEach(fullUser => {
		let obfuscatedUser = {name:fullUser.name,color:fullUser.color,id:fullUser.id,pitch:fullUser.pitch,speed:fullUser.speed,hats:fullUser.hats};
		result.push(obfuscatedUser);
	});
	return result;
}
function hasUser(roomId,guid){
	let result = false;
	result = publicrooms[roomId].users.some(r => guid == r.id);
	return result;
}
function eventRoom(eventName,messageData,originalUser){
	let currentRoom = publicrooms[originalUser.roomId];
	if(currentRoom.users.some(r => r.id == originalUser.id)){
		currentRoom.users.forEach(fullUser => {
			if(fullUser.socketId !== originalUser.socketId){
				io.to(fullUser.socketId).emit(eventName,messageData);
			}
		});
	}
}
function updateUser(originalUser,socketData,localDisplay=false){
	let currentRoom = publicrooms[originalUser.roomId];
	let result = {};
	
	if(currentRoom.users.some(r => r.id == originalUser.id)){
		result = Object.assign(originalUser,socketData);
		publicrooms[result.roomId].users[result.roomIndex] = result;
		
		let roomUsers = getUsers(result.roomId);
		let publicUser = getUsers(result.roomId)[result.roomIndex];
		
		eventRoom("updateUser",publicUser,originalUser);
		if(localDisplay)io.to(originalUser.socketId).emit("updateUser",publicUser);		
	} else {
		originalUser.roomIndex = currentRoom.users.length;
		result = Object.assign(originalUser,socketData);
		
		publicrooms[result.roomId].users.push(result);
	}
	
	return result;
}


io.on("connection", function(socket){
	var userid = Idgen(10);
	var newcolor = colorList[colorNames[Math.floor(Math.random()*colorNames.length)]];
	socket.user = {
		name: "Anonymous", 
		color: newcolor, 
		id: userid, 
		hats:[],
		messages: ["Welcome to BonziWORLD XP"],
		ip: socket.handshake.headers["x-forwarded-for"] || "127.0.0.1",
		loggedIn:false,
		roomId:"default",
		roomIndex:0,
		canMsg:true,
		pitch:80,
		speed:60,
		socketId:socket.id,
		msgAttempts:0
	};
	
	socket.on("login", (data) => {
		if(typeof data == "object"){
			if(typeof data.name !== "string")return;
			if(typeof data.room !== "string")return;
			data.name = blankify(data.name,config.rooms.nameLength); data.room = blankify(data.room,config.rooms.idLength);
			
			if(data.room == "")data.room = "default";
			if(data.name == "")data.name = "Anonymous";
			
			let over9000 = false;
			if(typeof skiddieWatch[socket.user.ip] == "object"){
				if(typeof skiddieWatch[socket.user.ip].lastLogged == "number"){
					over9000 = skiddieWatch[socket.user.ip].lastLogged < config.rateLimit*5 || skiddieWatch[socket.user.ip].instances > 2;
				}
			}
			if(!over9000){
				if(typeof skiddieWatch[socket.user.ip] !== "object"){
					skiddieWatch[socket.user.ip] = {instances:1,lastLogged:0};
				} else {
					skiddieWatch[socket.user.ip].instances++;
					skiddieWatch[socket.user.ip].lastLogged=0;
				}
			
			
				socket.user = updateUser(
					socket.user,
					{name:data.name,roomId:data.room},
					false
				);
			
				let roomUsers = getUsers(data.room);
				let publicUser = getUsers(data.room)[socket.user.roomIndex];
				eventRoom("newuser",publicUser,socket.user);
				socket.emit("room",{isPublic:true,isOwner:false});
				socket.emit("userlist",{list:roomUsers});
				
				socket.user.loggedIn=true;
			
				socket.on("msg", (data) => {
					
					if(typeof data == "object"){
						if(typeof data.msg !== "string")return;
						data.msg = blankify(data.msg);
						if(typeof data.quote == "object"){
							if(typeof data.quote.msg == "string" && typeof data.quote.name == "string"){
								data = {
									msg:data.msg,
									quote:{text:blankify(data.quote.msg),name:blankify(data.quote.name)},
									id:socket.user.id
								};
							}
						} else {
							data = {msg:data.msg,id:socket.user.id};
						}
						socket.user.msgAttempts++;
						setTimeout(() => {
							eventRoom("msg",data,socket.user);
							socket.emit("msg",data);
							socket.user.msgAttempts--;
						},socket.user.msgAttempts*config.rateLimit);
					}
				});
				socket.on("command", (data) => {
					if(typeof data == "object"){
						if(typeof data.type == "undefined" || typeof data.param !== "string")return;
						if(Object.keys(config.commands).includes(data.type)){
							socket.user.msgAttempts++;
							setTimeout(() => {
								let cmdresult = config.commands[data.type](socket,data.param);
								if(typeof cmdresult == "object")socket.user = cmdresult;
								socket.user.msgAttempts--;
							},socket.user.msgAttempts*config.rateLimit);
							
						}
					}
					/*{
						type:cmdname,
						param:cmdparam
					}*/
				});

				socket.on("disconnect", () => {
					publicrooms[socket.user.roomId].users.splice(socket.user.roomIndex,1);
					if(typeof skiddieWatch[socket.user.ip] == "object"){
						if(skiddieWatch[socket.user.ip].instances > 0 && socket.user.loggedIn)skiddieWatch[socket.user.ip].instances--;
						
						if(skiddieWatch[socket.user.ip].instances < 1)delete skiddieWatch[socket.user.ip];
					}
				});
		} else {
			socket.emit("err","COMPUTER (SENTIENT) SAYS: dont log in too fast or too many times it hurts my feelings");
			
		}
		}
	});

	
})
