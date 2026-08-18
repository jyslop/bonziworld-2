var express = require('express');
var copypastas = require('./copypastas.js');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors');
var fs = require('fs');
var crypto = require('crypto');
var bans = require('./bans.js');

let proxiesIPV4 = fs.readFileSync('./badip/ipsum.txt','utf-8') + "\n" + fs.readFileSync('./badip/data.txt','utf-8') + "\n" + fs.readFileSync('./badip/data2.txt','utf-8') + "\n" + fs.readFileSync('./badip/ipsum2.txt','utf-8');

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
  " onload=",
  " onerror=",
  " src=",
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
	godword:"skodwarde",
	powDifficulty: 4,
	powChallengeExpiry: 60000,
	rooms:{
		idLength:50,
		nameLength:30
	},
    mediaWhitelist:['https://files.catbox.moe','https://litter.catbox.moe','https://wikipedia.org','https://i.ibb.co','https://upload.wikimedia.org'],
	videoFormats:['.mp4','.mov'],
	imageFormats:['.webp','.png','.jpeg','.jpg','.gif','.bmp','.ico'],
	commands:{
		"color":(thisSocket,eventData)=>{
			if(typeof eventData == "string"){ 
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
				['animation_preset','shrug_back'],
				...e[Math.floor(Math.random()*e.length)],
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
				...e[Math.floor(Math.random()*e.length)],
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
		
		"bless":(thisSocket,param)=>{
			if(thisSocket.user.level > 2){
				let currentRoom = publicrooms[thisSocket.user.roomId];
				currentRoom.users.forEach(userObject => {
					if(userObject.id == param){
						userObject.level = 2;
						userObject = updateUser(userObject,{color:'./img/bonzi/blessed.png',tag:'Blessed'},true);
					}
				});
			}
		},
		"glow":(thisSocket,param)=>{
			if(thisSocket.user.level > 1){
				thisSocket.user = updateUser(thisSocket.user,{color:"./img/bonzi/glow.webp",tag:"<img src='/img/desktop/icons/wrench_antenna.png' class='tagicon'>"},true);
				return thisSocket.user;
			}
		},
		"noob":(thisSocket,param)=>{
			if(thisSocket.user.level > 1){
				thisSocket.user = updateUser(thisSocket.user,{color:"./img/bonzi/noob.webp",tag:"<img src='/img/desktop/icons/wrench_antenna.png' class='tagicon'>"},true);
				return thisSocket.user;
			}
		},
		"pope":(thisSocket,param)=>{
			if(thisSocket.user.level > 1){
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
function blankify(input, maxLength = 2500) {
  if (typeof input !== 'string') return '';

  return input
    //normalize unicode (prevents lookalike/homoglyph tricks)
    .normalize('NFKC')
    //strip control characters & zero-width chars (invisible payloads + RTL override tricks)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    //rape whitespace
    .trim()
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    //commands and events already limit string length but whatever
    .slice(0, maxLength)
    //no html keed
    .replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
}
function getUsers(roomId){
	let result = [];
	publicrooms[roomId].users.forEach(fullUser => {
		let obfuscatedUser = {name:fullUser.name,color:fullUser.color,id:fullUser.id,pitch:fullUser.pitch,speed:fullUser.speed,hats:fullUser.hats||[],tag:fullUser.tag||"",typing:fullUser.typing};
		result.push(obfuscatedUser);
	});
	return result;
}
function findUser(roomId,guid){
	let result = -1;
	publicrooms[roomId].users.forEach(r => {if(r.id == guid){result = r;}});
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

setInterval(() => {
	Object.keys(bans).forEach(banIp => {
		let banCurrent = bans[banIp];
		
		if(!isNaN(parseFloat(banCurrent.duration))){
			bans[banIp].duration = (parseFloat(bans[banIp].duration)-1).toString();
			if(parseFloat(banCurrent.duration) < 1){
				delete bans[banIp];
			}
		}
	});
	fs.writeFileSync('./bans.js',`
							module.exports = ${JSON.stringify(bans,null,2)};
						`,'utf-8')
},60000);

function verifyPoW(challenge, nonce, difficulty) {
	let attempt = challenge + ':' + nonce;
	let hash = crypto.createHash('sha256').update(attempt).digest('hex');
	let prefix = '0'.repeat(difficulty);
	return hash.startsWith(prefix);
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

	socket._powChallenge = null;
	socket._powExpiry = null;
	socket._pendingLoginData = null;

	if(Object.keys(bans).includes(socket.user.ip)){
		let entry = bans[socket.user.ip];
		let MINUTES = parseFloat(entry.duration);
		
		let result = {duration:'',reason:entry.reason};
		if(MINUTES > 59){
			result.duration+=(Math.floor(MINUTES/60)).toString()+' hours and ';
			result.duration+=Math.round((MINUTES/60)-Math.floor(MINUTES/60)).toString()+' minutes';
		}
		else {result.duration+=MINUTES.toString()+' minutes';}
		socket.emit("ban",result);
	} else {
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

			socket._pendingLoginData = data;

			let challenge = crypto.randomBytes(16).toString('hex');
			socket._powChallenge = challenge;
			socket._powExpiry = Date.now() + config.powChallengeExpiry;

			socket.emit('pow_challenge', {challenge: challenge, difficulty: config.powDifficulty});
		}
		}
	});

	socket.on("pow_solution", (data) => {
		if(typeof data != "object")return;
		if(typeof data.nonce != "string" && typeof data.nonce != "number")return;
		if(!socket._powChallenge || !socket._pendingLoginData)return;
		if(Date.now() > socket._powExpiry){
			socket.emit("err","PoW challenge expired. Please try again.");
			socket._powChallenge = null;
			socket._pendingLoginData = null;
			return;
		}

		let nonce = String(data.nonce);
		if(!verifyPoW(socket._powChallenge, nonce, config.powDifficulty)){
			socket.emit("err","Invalid proof of work. Please try again.");
			socket._powChallenge = null;
			socket._pendingLoginData = null;
			return;
		}

		socket._powChallenge = null;
		let loginData = socket._pendingLoginData;
		socket._pendingLoginData = null;

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
					{name:loginData.name,roomId:loginData.room},
					false
				);
			
				let roomUsers = getUsers(loginData.room);
				let publicUser = getUsers(loginData.room)[socket.user.roomIndex];
				eventRoom("newuser",publicUser,socket.user,false);

				let matchingIds = publicrooms[loginData.room].owner == socket.user.id;
				socket.emit("room",{
					isPublic:publicrooms[loginData.room].isPublic,
					isOwner:matchingIds,
					id:socket.user.roomId,
					room:loginData.room
				});
				setTimeout(() => {socket.emit("userlist",{list:roomUsers})},100);
				
				socket.user.loggedIn=true;
				socket.on("banUser",(data) => {
					if(typeof data == "object" && socket.user.level > 2){
						if(typeof data.id !== 'string' || typeof data.hours !== 'string' || typeof data.minutes !== 'string' || typeof data.reason !== 'string')return;
						if(data.reason.length < 1)data.reason='Unknown';
						
						
						let targetUser = findUser(socket.user.roomId,data.id);
						if(typeof targetUser == 'number')return;
						
						let result = {duration:0,reason:''};
						
						let sleeperAgent = ['forever','infinite'];
						if(sleeperAgent.includes(data.hours.toLowerCase()) || 
						sleeperAgent.includes(data.minutes.toLowerCase())
						){
							result.duration=null;
						}else {result.duration=parseFloat(data.minutes)+(parseFloat(data.hours)*60);}
						result.reason=data.reason;
						result.duration=result.duration.toString();
				
bans[targetUser.ip] = result;
fs.writeFileSync('./bans.js', `
    module.exports = ${JSON.stringify(bans, null, 2)};
`, 'utf-8');

let targetSocket = targetUser.socket;
eventRoom('leave', { id: targetUser.id }, targetUser, true);
let room = publicrooms[targetUser.roomId];
if (room) {
    room.users = room.users.filter(u => u.id !== targetUser.id);
    if (room.users.length < 1) {
        delete publicrooms[targetUser.roomId];
    }
}
if (targetSocket) {
    targetSocket.emit('ban', { duration: result.duration, reason: result.reason });
    setTimeout(() => { targetSocket.disconnect(true); }, 3000);
}
					}
				});
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
					if(typeof data != "string" && typeof data != "number")return;
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
    let room = publicrooms[socket.user.roomId];
    if (!room) return;

    eventRoom('leave', { id: socket.user.id }, socket.user, true);

    room.users = room.users.filter(
        user => user.id !== socket.user.id
    );

    if (room.users.length < 1) {
        delete publicrooms[socket.user.roomId];
    }
if(typeof skiddieWatch[socket.user.ip] == "object"){
						if(skiddieWatch[socket.user.ip].instances > 0 && socket.user.loggedIn){skiddieWatch[socket.user.ip].instances--; skiddieWatch[socket.user.ip].lastLogged=0;}
						
						if(skiddieWatch[socket.user.ip].instances < 1)delete skiddieWatch[socket.user.ip];
					}
});
		} else {
			socket.emit("err","COMPUTER (SENTIENT) SAYS: dont log in too fast or too many times it hurts my feelings");
			
		}
	});

	}
});