var express = require('express');
var copypastas = require('./copypastas.js');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors');
var fs = require('fs');

let proxiesIPV4 = fs.readFileSync('./badip/ipsum.txt','utf-8') + "\n" + fs.readFileSync('./badip/data.txt','utf-8');
/*
let proxyASNs = [9009, 20473, 14618]; 
let { lookup } = require('geoip-lite'); */


function isFucked(ip) {
	let result = false;
	if(ip.includes(',')){
		ip = ip.split(',');
		ip.forEach(ipv4value => {
			if(proxiesIPV4.includes(ipv4value))result=true;
		});
	} else {
		if(proxiesIPV4.includes(ip))result=true;
	}
    return result;
}

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
    mediaWhitelist:['https://files.catbox.moe','https://litter.catbox.moe','https://wikipedia.org','https://i.ibb.co','https://upload.wikimedia.org'],
	videoFormats:['.mp4','.mov'],
	imageFormats:['.webp','.png','.jpeg','.jpg','.gif','.bmp','.ico'],
	commands:{
		"color":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){ //i already check the types but might as well give the shop owner a self-defense weapon too
				
				if(!config.mediaWhitelist.some(r => eventData.startsWith(r)) && !colorNames.includes(eventData))return;
				if(colorNames.includes(eventData) && eventData !== "pope")eventData=colorList[eventData];
				let roomUsers = getUsers(thisSocket.user.roomId);
				let publicUser = getUsers(thisSocket.user.roomId)[thisSocket.user.roomIndex];
				
				thisSocket.user = updateUser(thisSocket.user,{color:eventData},true);
				return thisSocket.user;
			}
		},
		"name":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){
				eventData = blankify(eventData,config.rooms.nameLength);
				
				let roomUsers = getUsers(thisSocket.user.roomId);
				let publicUser = getUsers(thisSocket.user.roomId)[thisSocket.user.roomIndex];
				
				thisSocket.user = updateUser(thisSocket.user,{name:eventData},true);
				return thisSocket.user;
			}
		},
		"joke":(thisSocket,eventData)=>{
			if(typeof eventData != 'string')return;
			let i = copypastas['jokes'].intros;
			let m = copypastas['jokes'].middle;
			let e = copypastas['jokes'].ending;
			let eventConstruct = [
				...i[Math.floor(Math.random()*i.length)],
			 	['animation_preset','shrug_fwd'],
				...m[Math.floor(Math.random()*m.length)],
				['animation_reset'],
				...e[Math.floor(Math.random()*e.length)],
				['animation_reset'],
			];
			eventRoom("userEvent",{id:thisSocket.user.id,events:eventConstruct},thisSocket.user,true);
		},
		"fact":(thisSocket,eventData)=>{
			if(typeof eventData != 'string')return;
			let i = copypastas['facts'].intros;
			let m = copypastas['facts'].middle;
			let e = copypastas['facts'].ending;
			let eventConstruct = [
				...i[Math.floor(Math.random()*i.length)],
				...m[Math.floor(Math.random()*m.length)],
				['animation_reset'],
				...e[Math.floor(Math.random()*e.length)],
				['animation_reset'],
			];
			eventRoom("userEvent",{id:thisSocket.user.id,events:eventConstruct},thisSocket.user,true);
		},
		"linux":(thisSocket,eventData)=>{
			if(typeof eventData != "string")return;
			eventRoom("userEvent",{id:thisSocket.user.id,events:copypastas['extra']['linux'] },thisSocket.user,true);
		},
		"joel":(thisSocket,eventData)=>{
			if(typeof eventData != "string")return;
			eventRoom("userEvent",{id:thisSocket.user.id,events:copypastas['extra']['joel'] },thisSocket.user,true);
		},
		"asshole":(thisSocket,eventData)=>{
			eventData = {to:eventData};
			if(typeof eventData == "object"){
				eventRoom("asshole",{by:thisSocket.user.id,to:blankify(eventData.to)},thisSocket.user,true);
			}
		},
		"bass":(thisSocket,eventData)=>{
			eventData = {to:eventData};
			if(typeof eventData == "object"){
				eventRoom("bass",{by:thisSocket.user.id,to:blankify(eventData.to)},thisSocket.user,true);
			}
		},
		"tag":(thisSocket,eventData)=>{
			if(thisSocket.user.level > 1 && typeof eventData == "string"){
				eventData = blankify(eventData,32);
				thisSocket.user = updateUser(thisSocket.user,{tag:eventData},true);
				return thisSocket.user;
			}
		},
		"modtag":(thisSocket,eventData)=>{
			if(thisSocket.user.level > 1 && typeof eventData == "string"){
				let parts = eventData.split(" ");
				let targetId = parts[0];
				let newTag = blankify(parts.slice(1).join(" "),32);
				let targetRoom = publicrooms[thisSocket.user.roomId];
				if(targetRoom){
					let targetUser = targetRoom.users.find(u => u.id == targetId);
					if(targetUser){
						updateUser(targetUser,{tag:newTag},true);
					}
				}
			}
		},
		"roompublic":(thisSocket,eventData)=>{
			if(typeof eventData != 'string')return;
			let currentRoom = publicrooms[thisSocket.user.roomId];
			if(currentRoom.owner == thisSocket.user.id){
				if(eventData == 'on')publicrooms[thisSocket.user.roomId].isPublic=true;
				if(eventData == 'off')publicrooms[thisSocket.user.roomId].isPublic=false;
			}
		},
		"modname":(thisSocket,eventData)=>{
			if(thisSocket.user.level > 1 && typeof eventData == "string"){
				let parts = eventData.split(" ");
				let targetId = parts[0];
				let newName = blankify(parts.slice(1).join(" "),30);
				let targetRoom = publicrooms[thisSocket.user.roomId];
				if(targetRoom){
					let targetUser = targetRoom.users.find(u => u.id == targetId);
					if(targetUser){
						updateUser(targetUser,{name:newName},true);
					}
				}
			}
		},
		"nuke":(thisSocket,eventData)=>{
    if(thisSocket.user.level > 1 && typeof eventData == "string"){
        let targetRoom = publicrooms[thisSocket.user.roomId];
        if(targetRoom){
            let targetUser = targetRoom.users.find(u => u.id == eventData);
            if(targetUser){
                let targetSocket = targetUser.socket; 
                eventRoom('nuke',{id:targetUser.id},targetUser,true);
                setTimeout(() => {targetSocket.disconnect(true);},3000);
            }
        }
    }
},
		"godmode":(thisSocket,param)=>{
			if(param == config.godword){
				thisSocket.user.level=3;
				return thisSocket.user;
			}
		},
		"pope":(thisSocket,param)=>{
			if(thisSocket.user.level > 2){
				thisSocket.user = updateUser(thisSocket.user,{color:"./img/bonzi/pope.png",tag:"<img src='/img/desktop/icons/wrench_antenna.png' class='tagicon'>"},true);
				return thisSocket.user;
			}
		},
		"hat":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){
				let hatName = eventData.trim().toLowerCase();
				let maxHats = thisSocket.user.level >= 3 ? 5 : 2;
				if(hatName.length < 1){
					thisSocket.user = updateUser(thisSocket.user,{hats:[]},true);
					return thisSocket.user;
				}
				if(!Object.keys(hatList).includes(hatName))return;
				let currentHats = thisSocket.user.hats || [];
				let hatIdx = currentHats.indexOf(hatName);
				if(hatIdx !== -1){
					currentHats = currentHats.filter(h => h !== hatName);
				} else {
					if(currentHats.length >= maxHats){
						currentHats = currentHats.slice(1);
					}
					currentHats = currentHats.concat([hatName]);
				}
				thisSocket.user = updateUser(thisSocket.user,{hats:currentHats},true);
				return thisSocket.user;
			}
		},
		"media":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){
				if(!config.mediaWhitelist.some(r => eventData.startsWith(r)))return;
				if(config.videoFormats.some(r => eventData.endsWith(r))){
					let videoSend = blankify(eventData);
					eventRoom('msg',{msg:'- <video class="user_vid" controls><source src="'+videoSend+'" type="video/mp4"></video>',id:thisSocket.user.id},thisSocket.user,true);
				}
				if(config.imageFormats.some(r => eventData.endsWith(r))){
					let imgSend = blankify(eventData);
					eventRoom('msg',{msg:'- <img class="user_img" src="'+imgSend+'">',id:thisSocket.user.id},thisSocket.user,true);
				}
			}
		},
		"image":(thisSocket,eventData)=>{
			if(typeof eventData != "string")return;
			return config.commands["media"](thisSocket,eventData);
		},
		"video":(thisSocket,eventData)=>{
			if(typeof eventData != "string")return;
			return config.commands["media"](thisSocket,eventData);
		},
		"getrooms":(thisSocket,eventData)=>{
			if(typeof eventData != "string")return;
			let roomlist = [];

			Object.keys(publicrooms).forEach(roomName => {
				let roomObject = publicrooms[roomName];
				if(roomObject.isPublic)roomlist.push({name:roomName,users:roomObject.users.length});
			});
			thisSocket.emit('roomslist',roomlist);
		}
	}
};
var godword = "wewuzchatascoloredmunkeez";
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
let hatList = {
  "wizard": "./img/bonzi/hats/wizard.png",
  "windows": "./img/bonzi/hats/windows.png",
  "truck": "./img/bonzi/hats/truck.png",
  "rainbow": "./img/bonzi/hats/rainbow.png",
  "premium": "./img/bonzi/hats/premium.png",
  "pirate": "./img/bonzi/hats/pirate.png",
  "peedy": "./img/bonzi/hats/peedy.png",
  "ninja": "./img/bonzi/hats/ninja.png",
  "joel": "./img/bonzi/hats/joel.png",
  "hat": "./img/bonzi/hats/hat.png",
  "crown": "./img/bonzi/hats/crown.png",
  "cowboy": "./img/bonzi/hats/cowboy.png",
  "clippy": "./img/bonzi/hats/clippy.png",
  "chef": "./img/bonzi/hats/chef.png",
  "blunt": "./img/bonzi/hats/blunt.png",
  "astronaut": "./img/bonzi/hats/astronaut.png"
};
let colorNames = Object.keys(colorList);
var botmsg = [
"- hi",'- bundasworld revive HD deluxe ++'];

var publicrooms ={ "default":{
   isPublic:true,
	owner:'none',
   users: [
    {name: "BonziBUDDY", color: "/img/bonzi/purple.png", id: "bonzibuddy", tag:"<img src='/img/desktop/icons/server.png' class='tagicon'>",pitch: 80, speed: 150, messages: [],socketId:"bonziBuddy", hats:[]}
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
		let obfuscatedUser = {name:fullUser.name,color:fullUser.color,id:fullUser.id,pitch:fullUser.pitch,speed:fullUser.speed,hats:fullUser.hats||[],tag:fullUser.tag||"",typing:fullUser.typing};
		result.push(obfuscatedUser);
	});
	return result;
}
function hasUser(roomId,guid){
	let result = false;
	result = publicrooms[roomId].users.some(r => guid == r.id);
	return result;
}
function eventRoom(eventName,messageData,originalUser,displayLocal=false){
	let currentRoom = publicrooms[originalUser.roomId];
	if(typeof currentRoom != 'object')return;
	if(currentRoom.users.some(r => r.id == originalUser.id)){
		currentRoom.users.forEach(fullUser => {
			if(fullUser.socketId == originalUser.socketId){
				if(displayLocal){
					io.to(fullUser.socketId).emit(eventName,messageData);
				}
			} else {
				io.to(fullUser.socketId).emit(eventName,messageData);
			}
		});
	}
}
function updateUser(originalUser,socketData,localDisplay=false){
	let result = Object.assign(originalUser,socketData);
	let currentRoom = publicrooms[originalUser.roomId];
	if(typeof currentRoom != 'object'){
		publicrooms[originalUser.roomId]={isPublic:false,owner:originalUser.id,users:[]};
		currentRoom = publicrooms[result.roomId];
		result.roomIndex = currentRoom.users.length;
	}
	if(currentRoom.users.some(r => r.id == originalUser.id)){
		publicrooms[result.roomId].users[result.roomIndex] = result;
		
		let roomUsers = getUsers(result.roomId);
		let publicUser = getUsers(result.roomId)[result.roomIndex];
		
		eventRoom("updateUser",publicUser,originalUser);
		if(localDisplay)io.to(originalUser.socketId).emit("updateUser",Object.assign({},publicUser,{level:originalUser.level}));		
	} else {
		result.roomIndex = currentRoom.users.length;
		
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
		typing:false,
		roomIndex:0,
		canMsg:true,
		pitch:80,
		speed:60,
		socketId:socket.id,
		msgAttempts:0,
		level:1,
		tag:"",
		socket:socket
	};
	
	socket.on("login", (data) => {
		    socket.removeAllListeners('msg');
    socket.removeAllListeners('typing');
    socket.removeAllListeners('command');
		if(isFucked(socket.user.ip)){
			socket.emit("err","No proxies allowed right now");
			return;
		}
		else {
		
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

				let matchingIds = publicrooms[data.room].owner == socket.user.id;
				socket.emit("room",{
					isPublic:publicrooms[data.room].isPublic,
					isOwner:matchingIds,
					id:socket.user.roomId
				});
				socket.emit("userlist",{list:roomUsers});
				
				socket.user.loggedIn=true;
			
				socket.on("msg", (data) => {
					
					if(typeof data == "object"){
						if(typeof data.msg !== "string")return;
						data.msg = blankify(data.msg);
						if(data.msg.length < 1)return;
						if(typeof data.quote == "object"){
							if(typeof data.quote.msg == "string" && typeof data.quote.name == "string"){
								data = {
									msg:data.msg,
									quote:{msg:blankify(data.quote.msg),name:blankify(data.quote.name)},
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
						},(socket.user.msgAttempts)*config.rateLimit);
					}
				});
				socket.on("typing",(data) => {
					console.log(JSON.stringify(data));
					if(typeof data != "string" && typeof data != "number")return;
					//people might be able to crash this by running it in non-existent rooms or logged out idk lol
					let status = false;
					if(data === 0)status=false;
					if(data === 1)status=true;
						
					updateUser(
							socket.user,
							{typing:status},
							true
						);
				});
				socket.on("command", (data) => {
					if(typeof data == "object"){
						if(typeof data.type !== "string" || typeof data.param !== "string")return;
						if(Object.keys(config.commands).includes(data.type)){
							socket.user.msgAttempts++;
							setTimeout(() => {
								let cmdresult = config.commands[blankify(data.type)](socket,blankify(data.param));
								if(typeof cmdresult == "object")socket.user = cmdresult;
								socket.user.msgAttempts--;
							},socket.user.msgAttempts*config.rateLimit);
							
						}
					}
				});

				socket.on("disconnect", () => {
					eventRoom('leave',{id:socket.user.id},socket.user,true);
					publicrooms[socket.user.roomId].users.splice(socket.user.roomIndex,1);
					if(publicrooms[socket.user.roomId].users.length < 1)delete publicrooms[socket.user.roomId];
					if(typeof skiddieWatch[socket.user.ip] == "object"){
						if(skiddieWatch[socket.user.ip].instances > 0 && socket.user.loggedIn){skiddieWatch[socket.user.ip].instances--; skiddieWatch[socket.user.ip].lastLogged=0;}
						
						if(skiddieWatch[socket.user.ip].instances < 1)delete skiddieWatch[socket.user.ip];
					}
				});
		} else {
			socket.emit("err","COMPUTER (SENTIENT) SAYS: dont log in too fast or too many times it hurts my feelings");
			
		}
		}
		
		
		
		}
	});

	
});
