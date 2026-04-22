let profileList = loadArray('profiles');
profileList = profileList == null ? [ {name:'Anonymous',color:'purple',hats:[],godmodePass:null} ] : profileList;
let disconnectHandle = () => {};
var socket = io(location.href,{reconnection:false});
var first = true;
var userAmt = 0;
var userlist = [];
var bonzislist = [];
var mousex = 0;
var mousey = 0;
var myLevel = 1;
var bonziZCounter = 100;
var replyTarget = null;

let listenerNames = ["msg","asshole","userlist","leave","newuser","room","userEvent"];
function setCookie(cname,cvalue,exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function markupify(text,removeMarkupze=false){
	let keys = {
		'**':{pair:['<div class="md-bold">','</div>'],open:false},
		'~~':{pair:['<div class="md-italics">','</div>'],open:false},
		'$r$':{pair:['<div class="md-rainbow">','</div>'],open:false},
		'``':{pair:['<div class="md-code">','</div>'],open:false},
		'__':{pair:['<u>','</u>'],open:false},
		'--':{pair:['<del>','</del'],open:false},
		'%%':{pair:['<marquee>','</marquee>'],open:false},
	};
	let keyList = Object.keys(keys);
	while(keyList.some(r => text.includes(r))){
		keyList.forEach(keyName => {
			if(removeMarkupze){
				text = text.replaceAll(keyName,'')
			} else {
				if(keys[keyName].open){
					text = text.replace(keyName,keys[keyName].pair[1]);
				} else {
					text = text.replace(keyName,keys[keyName].pair[0]);
				}
				keys[keyName].open = !keys[keyName].open;
			}
		    
		});
	}

	return text;
}
function reversify(newArray){
	let result = [];

	for(let i=newArray.length-1;i>0;i--){ //for loops if they were evil and fucked up and twisted and sick in the head:
		result.push(newArray[i]); //calm down woody we're you're friends
	} // shut up buzz
	// i'll kill you
	return result;
}
class Notify {
    constructor(properties={title:"Alert",icon:"./img/desktop/infobubble.png",body:"Empty",parent:'info_icon'}){
        properties.title = properties.title || "Alert";
        properties.icon = properties.icon || "./img/desktop/infobubble.png";
        properties.body = properties.body || "Empty";
        properties.parent = properties.parent || 'info_icon';
        this.properties = properties;
        this.id = Id(5);
        let r = document.getElementById(properties.parent).getBoundingClientRect();
        let w = 350; let h = 100;
        let x = r.x-w;
        let y = r.y-h;
        document.getElementById('content').insertAdjacentHTML('beforeend',`
            <div class="bubble_chat" style="left:${x}px;top:${y}px;width:350px;height:100px;padding:0px 0px;max-width:400px;max-height:100px;z-index:9999;" id="${this.id}">
                <div style="padding:0px;height:10px;margin-top:-25px;"><img src="${properties.icon}" width="14" height="14"> &nbsp; <b>${properties.title}</b> <button style="width:20px;height:20px;float:right;" onclick="document.getElementById('${this.id}').remove();document.getElementById('icon_toggle_btn').style.visibility = 'visible';">X</button></div>
            <div style="height:max-content;font-family:'WinXP';font-size:16px;overflow:hidden;padding:3px;">${properties.body}</div>
        </div>
        `);
        let nopelie = () => {
           if(document.getElementById(this.id) !== null){
               r = document.getElementById(properties.parent).getBoundingClientRect();
               x = r.x-w;
               y = r.y-h;
               document.getElementById(this.id).style.left = x+"px";
               document.getElementById(this.id).style.top = y+"px";
           } 
        };
        window.onresize = () => {nopelie();};
        document.onresize = () => {nopelie();};
        document.getElementById('icon_toggle_btn').style.visibility = 'hidden';
        setTimeout(() => {if(document.getElementById(this.id) != null)document.getElementById('icon_toggle_btn').style.visibility = 'visible';},8000);
    }
};
function insertNuke(x,y,color){
    let localId = Id(5);
    document.body.insertAdjacentHTML('beforeend',`
    <div style="width:200px;height:200px;overflow:hidden;position:absolute;left:${x}px;top:${y}px;animation:flyaway 1s ease-in;z-index:999;" id="${localId}">
        <div style="overflow:hidden;width:200px;height:160px;">
            <img src="${color}" width="3300" height="auto">
        </div>
        <img src="./img/desktop/nuke.gif" width="200" height="auto" style="position:relative;top:-200px;">
        
    </div>
    `);
    setTimeout(() => {document.getElementById(localId).remove();},1000);
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}
let errs = {
	"applet_open":()=>{new Dialog({width:280,height:100,html:`That applet is already open!`,title:'Error'});}
};
function saveArray(name,toSave){
	let stringified = JSON.stringify(toSave);
	setCookie(name,stringified,365);
}
function loadArray(arrayName){
	let loaded = getCookie(arrayName);
	if(loaded === null) {
		return null;
	}
	try {
		let result = JSON.parse(loaded);
		return result;
	} catch(e) {
		console.error("Error parsing loadArray:", e);
		return null;
	}
}
var logtxt = `
	<i>Welcome to BonziWORLD XP</i>
	<hr>
`;

var hatList = {
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

let applets = {
	"settings":{
		buttonId:"my_bonzi",
		open:false,
		onpress:()=>{
			if(document.body.innerHTML.includes('<input type="text" placeholder="Username" id="usernameswap">')){errs["applet_open"](); return;}
            new Dialog({title:"Settings",width:'400',height:'560',html:`
				<div style="width:400px;height:560px;overflow-y:scroll;overflow-x:hidden;">
				
				Color:<br>
				<div id="row_color1" style="display:flex;flex-direction:row;">
					
				</div>
				<div id="row_color2" style="display:flex;flex-direction:row;">
					
				</div>
				<input type="text" placeholder="crosscolor (optional, catbox.moe only)" id="ccurl">
				<button onclick="socket.emit('command',{type:'color',param:document.getElementById('ccurl').value});">submit CC</button>
				&nbsp;
				&nbsp;
				&nbsp;
				&nbsp;
				&nbsp;
				&nbsp;
				&nbsp;
				<button onclick="window.open('https://catbox.moe');">Catbox</button>
				<hr>
				Name:<br>
				<input type="text" placeholder="Username" id="usernameswap"><button onclick="socket.emit('command',{type:'name',param:document.getElementById('usernameswap').value}); profileList[0].name=document.getElementById('usernameswap').value;">Set Name</button>
				<hr>
				Hats:<br>
				<div id="hat_grid" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;width:300px;height:300px;overflow-y:scroll;overflow-x:hidden;"></div>
				<button onclick="socket.emit('command',{type:'hat',param:''}); profileList[0].hats=[];" style="margin-top:6px;">Clear Hats</button>
				
				</div>
			`,
			onclose:()=>{
				saveArray('profiles',profileList);
			}});
			let clrs = ['red','brown','green','blue','purple','pink','black'];
			let currentRow = 1;
			for(let i=0;i<clrs.length;i++){
				if(i >= clrs.length/2)currentRow=2;
				
				document.getElementById('row_color'+currentRow).insertAdjacentHTML('beforeend',`
					<button onclick="socket.emit('command',{type:'color',param:'${clrs[i]}'}); profileList[0].color='${clrs[i]}';">
						<div style="width:35px;height:35px;background-image:linear-gradient(white,${clrs[i].replaceAll('pink','magenta').replaceAll('purple','indigo')});"></div>
					</button>
				`);
			}
			let hatGrid = document.getElementById('hat_grid');
			Object.keys(hatList).forEach(hatName => {
				
				hatGrid.insertAdjacentHTML('beforeend',`
					<button title="${hatName}" onclick="socket.emit('command',{type:'hat',param:'${hatName}'}); profileList[0].hats.push('${hatName}')" style="display:flex;flex-direction:column;align-items:center;width:40px;font-size:10px;padding:3px;">
						<img src="${hatList[hatName]}" style="width:50px;height:40px;object-fit:contain;">
						${hatName}
					</button>
				`);
			});
		},
	},
	"mediaupload":{
		buttonId:"media_upload",
		open:false,
		onpress:()=>{
			uploadPopup();
		},
	},
	"bonzilog":{
		buttonId:"bonzi_log",
		open:false,
		onpress:()=>{
			if(document.body.innerHTML.includes('id="log_contents">')){errs["applet_open"](); return;}
            new Dialog({title:"BonziLOG",width:'275',height:'500',html:`
			<div style="width:100%;height:100%;overflow-x:hidden;overflow-y:none;" id="log_contents">
				${logtxt}
			</div>
			`});
		}
	},
	"roomsview":{
		buttonId:"rooms_view",
		open:false,
		onpress:()=>{
			if(document.body.innerHTML.includes('<div id="roomdir"'))return;
			socket.off('roomslist');
let roomWindow = new Dialog({title:'Room List',width:300,height:300,html:`
    <div id="roomdir" style="width:98%;height:85%;overflow-x:hidden;overflow-y:scroll;">Loading...</div><br>
    <input type="text" placeholder="Type room ID (optional)" id="room_custom"><button id="room_create">Visit Room</button>
`});
socket.emit('command',{type:'getrooms',param:''});
socket.on('roomslist',d=>{
	document.getElementById('room_create').onclick = () => {myRoom = document.getElementById('room_custom').value;disconnectErr=false; socket.disconnect();};
    let roomdir = document.getElementById('roomdir');
    let initLoop = () => {
		
		roomdir.innerHTML='';
	    d.forEach(roomObject => {
    	    let roomElement = document.createElement('button');
  		      roomElement.innerHTML = `
       	 	<img src="./img/desktop/icons/room.png" width="32" height="32">
       	 	<hr>
       		 <p>
        	        Room ID: <span style="font-weight:bold;font-size:18px;">${roomObject.name}</span>
	            <br>
            <span style="color:green;font-size:16px;">${roomObject.users} Users</span>
	        </p>
	        `;
    	    roomdir.appendChild(roomElement);
	        roomElement.onclick = () => {
				myRoom = roomObject.name;
				disconnectErr=false;
				socket.disconnect();
				roomWindow.element.remove();
				//socket.on('disconnect',disconnectHandle);
		 	};
	    });
		setTimeout(() => {
			if(document.body.innerHTML.includes('<div id="roomdir"'))socket.emit('command',{type:'getrooms',param:''});
		},5000);
	};
	initLoop();
});

		}
	}
};
let myRoom = 'default';
function clampBonziPosition(x, y) {
	var xmax = $(window).width() - 200;
	var ymax = $(window).height() - 160 - 30;
	var cx = Math.max(0, Math.min(x, xmax));
	var cy = Math.max(0, Math.min(y, ymax));
	return {x: cx, y: cy};
}

function clampAllBonzis() {
	for (var i = 0; i < bonzislist.length; i++) {
		var b = bonzislist[i];
		var el = document.getElementById(b.id);
		if (el) {
			var cx = parseInt(el.style.left) || 0;
			var cy = parseInt(el.style.top) || 0;
			var clamped = clampBonziPosition(cx, cy);
			b.move({x: clamped.x + "px", y: clamped.y + "px"});
		}
	}
}

function raiseBonzi(localId) {
	bonziZCounter++;
	var zBase = bonziZCounter * 5;
	var canvas = document.getElementById(localId);
	var nameEl = document.getElementById("name_" + localId);
	var chatEl = document.getElementById("chat_" + localId);
	var pointEl = document.getElementById("point_" + localId);
	if (canvas) canvas.style.zIndex = zBase;
	if (nameEl) nameEl.style.zIndex = zBase + 1;
	if (chatEl) chatEl.style.zIndex = zBase + 2;
	if (pointEl) pointEl.style.zIndex = zBase + 3;
	for (var li = 1; li <= 5; li++) {
		var hatCanvas = document.getElementById("hat" + li + "_" + localId);
		if (hatCanvas) hatCanvas.style.zIndex = zBase;
	}
}

$(window).on("resize", function() {
	clampAllBonzis();
	var iconBar = document.querySelector(".icon_bar");
	if (iconBar) {
		if ($(window).width() < 600) {
			iconBar.style.display = "none";
		} else {
			iconBar.style.display = "flex";
		}
	}
	updateIconToggleButton();
});

function updateIconToggleButton() {
	var btn = document.getElementById("icon_toggle_btn");
	if (!btn) return;
	if ($(window).width() < 600) {
		btn.style.display = "block";
	} else {
		btn.style.display = "none";
		var iconBar = document.querySelector(".icon_bar");
		if (iconBar) iconBar.style.display = "flex";
	}
}

$(window).load(function(){
  var toggleBtn = document.createElement("button");
  toggleBtn.id = "icon_toggle_btn";
  toggleBtn.innerHTML = "&#9776;";
  toggleBtn.style.cssText = "position:fixed;bottom:50px;right:8px;z-index:99999;font-size:18px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:5px;cursor:pointer;user-select:none;";
  document.body.appendChild(toggleBtn);

  toggleBtn.onclick = function() {
    var iconBar = document.querySelector(".icon_bar");
    if (iconBar) {
      iconBar.style.display = (iconBar.style.display === "flex") ? "none" : "flex";
    }
  };

  updateIconToggleButton();

  document.addEventListener("touchstart", touchHandler, true);
  document.addEventListener("touchmove", touchHandler, true);
  document.addEventListener("touchend", touchHandler, true);
  document.addEventListener("touchcancel", touchHandler, true);    
  if(isMobile()){
    $("#room_info").hide();
  }
  $("#login_load").hide();
  $("#login_card").show();
  $("#login_go1").click(() => {
      setTimeout(() => {
        var audioe = new Audio("/sound/start.mp3");
        audioe.play();
        first = false;
      },300);
    $("#login_card").html('<input id="login_name" type="text" placeholder="Nickname"><input id="login_room" type="text" placeholder="Room ID (Optional)"><div id="login_go"></div><div id="login_error" style="display:none"></div>');
    $("#login_go").click(login);
    $("#login_name, #login_room").keypress(function(e) {
      if(e.which == 13) {
        login();
      }
    });
  });
  socket.on("ban", (data) => {
    $("#page_ban").show();
  })
});
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function Id(length) {
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';var result = '';
   for (let i = 0; i < length; i++){
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}
function clearLog(){
	logtxt=`<i>Log reset.</i><hr>`;
	if(document.getElementById('log_contents') !== null)document.getElementById('log_contents').innerHTML = logtxt;
}
function setReplyTarget(name, msg) {
	replyTarget = {name: name, msg: msg};
	var indicator = document.getElementById('reply_indicator');
	if(!indicator){
		var cont = document.getElementById('chat_message_cont');
		var ind = document.createElement('div');
		ind.id = 'reply_indicator';
		ind.style.cssText = 'position:absolute;top:-22px;left:60px;background:rgba(0,0,60,0.75);color:#adf;font-family:WinXP,Tahoma,sans-serif;font-size:12px;padding:2px 6px;border-radius:3px 3px 0 0;white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;';
		ind.innerHTML = '&#x21A9; replying to <b>' + name + '</b><span onclick="clearReplyTarget();" style="cursor:pointer;margin-left:4px;color:#f88;">&#x2715;</span>';
		document.getElementById('chat_bar').appendChild(ind);
	} else {
		indicator.innerHTML = '&#x21A9; replying to <b>' + name + '</b><span onclick="clearReplyTarget();" style="cursor:pointer;margin-left:4px;color:#f88;">&#x2715;</span>';
	}
}
function clearReplyTarget() {
	replyTarget = null;
	var indicator = document.getElementById('reply_indicator');
	if(indicator) indicator.remove();
}
function newLog(options){
	var replyHtml = '';
	if(options.quote && options.quote.name && options.quote.msg){
		replyHtml = '<div style="border-left:3px solid #888;padding:2px 6px;margin-bottom:4px;background:rgba(0,0,0,0.07);font-size:12px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;"><b>' + options.quote.name + ':</b> ' + options.quote.msg + '</div>';
	}
	var msgId = 'logmsg_' + Id(8);
	var escapedName = options.name.replace(/'/g,"&#39;").replace(/"/g,"&quot;");
	var escapedMsg = options.msg.replace(/'/g,"&#39;").replace(/"/g,"&quot;");
	logtxt += '<div style="position:relative;padding-right:28px;">' + replyHtml + '<b>' + options.name + ':</b>' + options.msg + '<button onclick="setReplyTarget(\'' + escapedName + '\',\'' + escapedMsg + '\');" style="position:absolute;top:0;right:0;width:22px;height:22px;padding:0;font-size:11px;line-height:1;" title="Reply">&#x21A9;</button></div><hr>';
	if(document.getElementById('log_contents') !== null)document.getElementById('log_contents').innerHTML = logtxt;
}
function touchHandler(event){
  var touches = event.changedTouches,first = touches[0],type = "";
  switch(event.type){
    case "touchstart": type = "mousedown"; break;
    case "touchmove":  type = "mousemove"; break;        
    case "touchend":   type = "mouseup";   break;
    default:           return;
  }
  var simulated = document.createEvent("MouseEvent");
  simulated.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
  first.target.dispatchEvent(simulated);
}
function sendMsg(msg = $("#chat_message").val()){

  if(msg.startsWith("/")){
    var cmdtype = msg.substring(1, msg.indexOf(" ") === -1 ? msg.length : msg.indexOf(" "));
    var param = msg.indexOf(" ") === -1 ? "" : msg.substring(msg.indexOf(" ") + 1, msg.length);


	if(cmdtype == "godmode"){
		profileList[0].godmodePass=param;
		saveArray('profiles',profileList);
	}
    if(cmdtype === "clear"){
      clearLog();
      $("#chat_message").val("");
      return;
    }

    socket.emit("command",{type: cmdtype, param: param});
  } else {
    if(replyTarget){
      socket.emit("msg",{msg: msg, quote: {msg: replyTarget.msg, name: replyTarget.name}});
      clearReplyTarget();
    } else {
      socket.emit("msg",{msg: msg});
    }
  }
  $("#chat_message").val("");
}

function uploadPopup(initialFile) {
    let blobUrl = null;
    let dialog = new Dialog({
        title: "Send Image Or Video",
        x: 20,
        y: 50,
        width: 300,
        height: 200,
        html: `
            <button class="upload_dropzone">+</button>
            <div style="height: 2px;"></div>
            <input type="file" accept="image/*, video/*" class="upload_input" hidden>
            <div class="upload_buttons">
                <button class="xp-button upload_button" disabled>Send</button>
            </div>
        `,
        onclose: () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        },
    });
    let element = dialog.element;
    let dropzone = element.querySelector(".upload_dropzone");
    let button = element.querySelector(".upload_button");
	console.log(button);
    let fileInput = element.querySelector(".upload_input");
    let blob = null;

    function loadFile(file) {
        if (!file) return;
        blob = file;
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = URL.createObjectURL(blob);
        dropzone.style.background = `url("${blobUrl}") center center / contain no-repeat`;
        button.disabled = false;
    }

    if (initialFile) loadFile(initialFile);

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = () => loadFile(fileInput.files[0]);

    dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#003c74";
    };

    dropzone.ondragleave = () => {
        dropzone.style.borderColor = "";
    };

    dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "";
        loadFile(e.dataTransfer.files[0]);
    };
    button.onclick = async () => {
		console.log(blobUrl);
        if (!blobUrl) return;
        let formData = new FormData();
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", blob);
        formData.append("time", "1h");
        let response = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
            method: "POST",
            body: formData,
        });
        let url = await response.text();
        socket.emit("command",{type:"media",param:url});
        dialog.element.remove();
    };
}
let sanitize = (txt) => {return txt;};
let lastZ = 0;
let dragged = null;
let dragX = 0;
let dragY = 0;
let chatLogDragged = false;
window.onpointermove = (e) => {
    if (dragged) {
        dragged.move(e.pageX - dragX, e.pageY - dragY);
    }
    if (chatLogDragged) {
        window.onresize();
        chat_log.style.width = `${e.pageX - dragX}px`;
    }
};

window.onpointerup = () => {
    dragged = null;
    chatLogDragged = false;
};
class Dialog {
    constructor(opt = {}) {
        if (opt.title == null) opt.title = "Window";
        opt.width = opt.width || 400;
        opt.height = opt.height || 300;
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.onclose = opt.onclose || (() => {});
        this.element = document.createElement("div");
        if (opt.class) this.element.className = opt.class;
        this.element.classList.add("window");
        this.element.innerHTML = `
        <div class="window_header">
        ${sanitize(opt.title)}
        <div class="window_close"></div>
        </div>
        <div class="window_body">
        <div class="window_content">
        </div>
        </div>
        `;
        this.move(this.x, this.y);
        this.element.style.position = "absolute";
        this.element.style.zIndex = lastZ++ + 9999;
        this.element.querySelector(".window_header").onpointerdown = (e) => {
            dragged = this;
            dragX = e.pageX - this.x;
            dragY = e.pageY - this.y;
			if(dragX < 0)dragX=0;
			if(dragX > window.innerWidth - parseInt(this.element.width))dragX=window.innerWidth - parseInt(this.element.width);
			if(dragY < 0)dragY=0;
			if(dragY > window.innerHeight - parseInt(this.element.height))dragX=window.innerHeight - parseInt(this.element.height);
        };
        this.element.querySelector(".window_close").onclick = () => {
            this.element.remove();
            this.onclose();
        };
        this.element.style.width = `${opt.width}px`;
        this.element.style.height = `${opt.height}px`;
        this.element.querySelector(".window_content").innerHTML = opt.html;
        content.appendChild(this.element);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }
}
var colorCache = {
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
var animationList = {
	"praise":{"fwd":[
		[7,10],[8,10],[9,10],[10,10],[11,10],[12,10]
	],"back":reversify([[7,10],[8,10],[9,10],[10,10],[11,10],[12,10]])},
	"earth":{
		"fwd":[
		[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],[16,4],[17,4],
		[1,5],[2,5],[3,5]],
		"back":[
			[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[15,5],[15,5],[16,5],[17,5],
		[1,6],[2,6]
		]
	},
};
function bonzi(colorurl,left,top,property){
	let urlNames = {};
	let urlArrays = Object.keys(colorCache).map(r => {urlNames[colorCache[r]] = r; return colorCache[r];});
  this.color = urlArrays.some(r => r == colorurl || r.includes(colorurl)) ? urlNames[colorurl] : colorurl;
  let thisColor = this.color;
  var width = 200;
  var height = 160;
  var rows = 21;
  var columns = 17;
  var localId = property.id;
  this.frameTick = 70;
  this.id = localId;
  this.mute = false;
  var isStaticImage = false;

  if(property.pitch == undefined){
    property.pitch = 80;
  }
  if(property.speed == undefined){
    property.speed = 150;
  }
  let tagHtml = `<div id='tag_${localId}' class='bonzi_tag'></div>`;
  if(typeof property.tag != 'string')tagHtml=``;
  else {
	  if(property.tag.length < 1)tagHtml=``;
  }
  content.insertAdjacentHTML('beforeend',`
  <div id='name_${localId}' style='position:absolute;z-index:500;' class='bonzi_name'>${tagHtml} ${property.name}</div><canvas class='bonzi_canvas' width='200' height='160' style='position:absolute;top:${top};left:${left};z-index:500;' id='${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;z-index:500;' id='hat1_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;z-index:500;' id='hat2_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;z-index:500;' id='hat3_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;z-index:500;' id='hat4_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;z-index:500;' id='hat5_${localId}'></canvas><div id='chat_${localId}' class='bubble_chat' style='z-index:502;'><div class='msg_cont'>Test Message</div></div><div id='point_${localId}' class='bubble_point' style='z-index:503;'></div>
  `);
  $("#chat_"+localId).hide();
  $("#point_" + localId).hide();

  var currentHats = property.hats || [];
  var hatImgCache = {};

  var canvas = document.getElementById(localId);
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var draw = (x,y) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(isStaticImage){
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    }
  }

  var drawHatImg = (hatCtx, hatImg) => {
    hatCtx.clearRect(0, 0, 200, 160);
    hatCtx.drawImage(hatImg, 0, 0, hatImg.naturalWidth, hatImg.naturalHeight, 0, 0, 200, 160);
  };

  var drawHats = () => {
    for(let layerIdx = 0; layerIdx < 5; layerIdx++){
      let hatCanvas = document.getElementById('hat'+(layerIdx+1)+'_'+localId);
      if(!hatCanvas)continue;
      let hatCtx = hatCanvas.getContext('2d');
      hatCtx.clearRect(0, 0, 200, 160);
      if(layerIdx < currentHats.length){
        let hatName = currentHats[layerIdx];
        let hatSrc = hatList[hatName];
        if(!hatSrc)continue;
        if(hatImgCache[hatName]){
          drawHatImg(hatCtx, hatImgCache[hatName]);
        } else {
          let hatImg = new Image();
          hatImg.onload = () => {
            hatImgCache[hatName] = hatImg;
            drawHatImg(hatCtx, hatImg);
          };
          hatImg.src = hatSrc;
        }
      }
    }
  };
	var toFrame = (frameColumn,frameRow) => {
		let newX = (width*frameColumn)-width;
		let newY = (height*frameRow)-height;
		
		draw(newX,newY);
	};

var thisAnimation = {name:'idle',open:false};
var animationPlayback = (animationData,playType) => {
	if(typeof animationData['fwd'] != 'undefined'){
		if(playType == 'fwd')animationData = [...animationData['fwd']];
		else animationData = [...animationData['back'],null];
	}
	let newData = playType == 'fwd' ? animationData : [...animationData,null]; 
	let frameTick = this.frameTick;
	newData.forEach((frameInfo,i) => {
		setTimeout(() => {
			if(frameInfo != null){
				toFrame(...frameInfo);
			} else {
				draw(0,0);
			}
		},i*frameTick);
	});
};
  var animate = (properties) => {
    if(isStaticImage){
      draw(0,0);
      return;
    }
    if(properties.type == "idle"){
      draw(0,0);
    } 
    if(properties.type == "surf_right"){
      let x = 200;
      let y = 0;
      var col = columns * width - width - width;
      var row = 0;
      var anim = setInterval(() => {
        if(x > col){x = 0; y+=height;}
        if(y > row){y = 0;x = 0;}

        draw(x,y);
        x+=200;
      },80);
      setTimeout(()=>{clearInterval(anim)},750);
    }
    
  }
  var move = (properties) => {
    var yInt = parseInt(properties.y);
    var xInt = parseInt(properties.x);

    var clamped = clampBonziPosition(xInt, yInt);
    xInt = clamped.x;
    yInt = clamped.y;

    var namey = yInt - 10;
    var namex = xInt - 10;
    var chaty = namey + 65;
    var chatx = namex + 180;
    var pointx = chatx - 19;
    var pointy = chaty;

    document.getElementById("name_"+localId).style.top = namey + "px";
    document.getElementById("name_"+localId).style.left = namex + "px";
    document.getElementById("chat_"+localId).style.left = chatx + "px";
    document.getElementById("chat_"+localId).style.top = chaty + "px";
    document.getElementById("point_"+localId).style.top = pointy + "px";
    document.getElementById("point_"+localId).style.left = pointx + "px";
    canvas.style.left = xInt + "px";
    canvas.style.top = yInt + "px";
    for(let layerIdx = 1; layerIdx <= 5; layerIdx++){
      let hatCanvas = document.getElementById('hat'+layerIdx+'_'+localId);
      if(hatCanvas){
        hatCanvas.style.left = xInt + "px";
        hatCanvas.style.top = yInt + "px";
      }
    }
  }
	let thisName = property.name;
	this.name = thisName;
  
  var talk = (properties,onendCallback) => {
	 
    if(this.mute == true){
      return;
    }
    $("#chat_" + localId).show();
    $("#point_" + localId).show();

    var chatContent = '';
    if(properties.quote && properties.quote.name && properties.quote.msg){
      chatContent += '<div style="border-left:3px solid #888;padding:2px 5px;margin-bottom:4px;background:rgba(0,0,0,0.07);font-size:11px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;"><b>' + properties.quote.name + ':</b> ' + properties.quote.msg + '</div>';
    }
	properties.text = properties.text.replaceAll('{NAME}',thisName)
		.replaceAll('{COLOR}',thisColor);
	let originalText = markupify(properties.text,true);
	properties.text = markupify(properties.text)
    chatContent += properties.text;
    $("#chat_" + localId).html(chatContent);

   if(!properties.text.startsWith('-')){speak.play(
	   									properties.text, { pitch: property.pitch, speed: property.sped },
										()=>{
											if(typeof onendCallback == 'function')onendCallback();  
											$("#chat_" + localId).hide();
        									$("#point_" + localId).hide();
										}
        
   );}

    $("#bworg").click(() => {
      window.open("https://bonziworld.org","_blank");
    });
  
  } 
  var update = (properties) => {
    var tagEl = document.getElementById("tag_" + localId);
    if(tagEl){
      if(properties.tag && properties.tag.length > 0){
        tagEl.innerHTML = properties.tag;
        tagEl.style.display = "inline";
      } else {
        tagEl.innerHTML = "";
        tagEl.style.display = "none";
      }
    }
    $("#name_" + localId).html((properties.tag && properties.tag.length > 0 ? "<div class='bonzi_tag'>"+properties.tag+"</div>" : "") + properties.name);
    isStaticImage = false;
    if(typeof properties.firstJoin == "boolean"){
		property.firstJoin = properties.firstJoin;
		img.src = properties.color;
	}
	else {img.src = properties.color}
    draw(0,0);
    animate({type: "idle"});
    if(Array.isArray(properties.hats)){
      currentHats = properties.hats;
      drawHats();
    }
  }
  this.leave = (instant=false) => {
		let leaveFrames = [
			[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[15,2],[16,2],[17,2],
			[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],null
		];
		leaveFrames.forEach((frameInfo,i) => {
			setTimeout(() => {
				if(frameInfo != null && !instant){
					toFrame(...frameInfo);
				} else {
					document.getElementById(localId).remove();
					document.getElementById("name_" + localId).remove();
					document.getElementById("chat_" + localId).remove();
					document.getElementById("point_" + localId).remove();
					for(let layerIdx = 1; layerIdx <= 5; layerIdx++){
						let hatCanvas = document.getElementById('hat'+layerIdx+'_'+localId);
						if(hatCanvas)hatCanvas.remove();
					}
		
					bonzislist.splice(screenbonzis({id:localId}).queue,1);
					bonzislist.forEach((currentBonzi,i) => {bonzislist[i].queue=i;});
				}
			},i*this.frameTick);
		});
  };
  this.toFrame = toFrame;
  this.animate = animate;
  this.move = move;
  this.draw = draw;
  this.talk = talk;
  this.update = update;
  this.parseEvents = (eventArray) => {
	  let presetFrames = {
		  "shrug":{
			  "fwd":[],
			  "back":[]
		  }
	  };
	  let lastMsgLength = 1;
	  let i = 0;
	  let processArray = () => {
		  let exitContinue = () => {i++; processArray();}
		  
		  let eventCall = eventArray[i];
		  if(eventCall[0] == 'msg'){
			  talk({text:eventCall[1].msg},()=>{setTimeout(exitContinue,1000);});
		  } else if(eventCall[0] == 'animation_preset')  {
			  let animationNames = Object.keys(animationList);
			  let animationRequest = eventCall[1].split('_');
			  if(animationRequest.length > 1 && animationNames.includes(animationRequest[0])){
 				  let currentAnimation = animationList[animationRequest[0]];
				  animationPlayback(currentAnimation,animationRequest[1])
				  
				  setTimeout(exitContinue,2200);
			  } else {exitContinue();}
			  
		  }
	  };
	  processArray();
  };

  var pos = {x: document.getElementById(localId).style.left, y: document.getElementById(localId).style.top};

  this.tag = property.tag || "";
  this.name = property.name;

  if(this.tag && this.tag.length > 0){
    var tagEl = document.getElementById("tag_" + localId);
    if(tagEl){tagEl.innerHTML = this.tag; tagEl.style.display = "inline";}
  }

  img.src = colorurl;
  img.onload = () => {
    if(img.naturalWidth === 3400 && img.naturalHeight === 3360){
      isStaticImage = false;
    } else {
      isStaticImage = true;
    }
    draw(0,0);
    drawHats();
    var yInt = parseInt(document.getElementById(localId).style.top);
    var xInt = parseInt(document.getElementById(localId).style.left);
    move({x: xInt, y: yInt});
	if(typeof property.firstJoin == "boolean" ){
		if(property.firstJoin){
			let joinFrames = [
				[6,17],[7,17],[8,17],[9,17],[10,17],[11,17],[12,17],[13,17],[14,17],[15,17],[16,17],[17,17],
				[1,18],[2,18],[3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18],[13,18],[14,18],
				[1,1],null
			];
			let frameTick = this.frameTick;
			joinFrames.forEach((frameInfo,i) => {
				setTimeout(() => {
					if(frameInfo != null){
						toFrame(...frameInfo);
					} else {
						draw(0,0);
					}
				},i*frameTick);
			});
		} else {
			draw(0,0);
		}
	}
	
  }
  drawHats();

  var mousestat = "up";

  var touchDragActive = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var bonziStartX = 0;
  var bonziStartY = 0;

  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    raiseBonzi(localId);
    touchDragActive = true;
    var t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    bonziStartX = parseInt(canvas.style.left) || 0;
    bonziStartY = parseInt(canvas.style.top) || 0;
    $("body").css({"user-select":"none"});
  }, {passive: false});

  canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (!touchDragActive) return;
    var t = e.touches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    var nx = bonziStartX + dx;
    var ny = bonziStartY + dy;
    move({x: nx + "px", y: ny + "px"});
  }, {passive: false});

  canvas.addEventListener("touchend", function(e) {
    touchDragActive = false;
    $("body").css({"user-select":"auto"});
  }, {passive: false});

  var mouseloop = setInterval(() => {
    var xmax = $(window).width() - 200;
    var ymax = $(window).height() - 160 - 30;
    var newx = mousex - 90;
    var newy = mousey - 90;
    var xqueue = newx > 0 && newx < xmax;
    var yqueue = newy > 0 && newy < ymax;
    if(mousestat == "down"){
      if(xqueue && yqueue){
        move({x: newx + "px", y: newy + "px"});
      }
    }
    if(document.getElementById(localId)){
      pos = {x: $("#" + localId).position().left, y: $("#" + localId).position().top};

      this.left = pos.x;
      this.top = pos.y;
    }
    
  },10);
  document.onmousemove = (e) => {
    e = window.event;
    mousex = e.clientX;
    mousey = e.clientY;
  }
  document.getElementById(localId).onmousedown = () => {
    raiseBonzi(localId);
    mousestat = "down";
    $("body").css({
      "user-select": "none"
    });
    $(".context_menu").css({
      "user-select": "auto"
    });
  }
  document.getElementById(localId).onmouseup = () => {
    mousestat = "up";
    $("body").css({
      "user-select": "auto"
    });
    $(".context_menu").css({
      "user-select": "auto"
    });
  }
  document.getElementById(localId).oncontextmenu = () => {
    var parsetop1 = parseInt(document.getElementById(localId).style.top);
    var hidectx = () => {$("#context_" + localId).hide();$("#context_" + localId).remove();}
    var parsetop = parsetop1 + 50;
    $(".bonzi_canvas").on("mousedown", hidectx);
    $(".icon").click(hidectx);
    $("#chat_message").click(hidectx);
	var foundBonzi = screenbonzis({id:localId});
	var rawName = (foundBonzi && foundBonzi.name) ? foundBonzi.name : "";
	var toName = rawName;
	if(toName.indexOf('<') !== -1){
		var tmp = document.createElement('div');
		tmp.innerHTML = toName;
		toName = tmp.textContent || tmp.innerText || toName;
	}
	toName = toName.trim();

	var isMuted = foundBonzi && foundBonzi.mute === true;
	var muteLabel = isMuted ? 'Unmute' : 'Mute';

	$("#content").append(`
		<div class='context_menu' id='context_${localId}' style='top:${parsetop}px; left: ${document.getElementById(localId).style.left}'>
			<p class="context_text" id="${localId}_asshole" onclick='socket.emit("command",{type:"asshole",param:"${toName}"});'>Call an asshole</p>
			<p class="context_text" id="${localId}_asshole" onclick='socket.emit("command",{type:"bass",param:"${toName}"});'>Call a bass</p>
			<p class="context_text" id="${localId}_mute" onclick='(function(){var b=screenbonzis({id:"${localId}"});if(b){b.mute=!b.mute;document.getElementById("${localId}_mute").innerText=b.mute?"Unmute":"Mute";}})();'>${muteLabel}</p>
			<div id="ctx_mod_${localId}"></div>
		</div>`);
	var modDiv = document.getElementById("ctx_mod_"+localId);
	if(myLevel > 1){
		modDiv.insertAdjacentHTML('beforeend','<hr style="margin:2px 0;">');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" onclick=\'(function(){var t=prompt("New tag for '+toName+':");if(t!==null)socket.emit("command",{type:"modtag",param:"'+localId+' "+t});})()\'>Set tag</p>');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" onclick=\'(function(){var n=prompt("New name for '+toName+':");if(n!==null)socket.emit("command",{type:"modname",param:"'+localId+' "+n});})()\'>Set name</p>');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" style="color:red;" onclick=\'if(confirm("Nuke '+toName+'?"))socket.emit("command",{type:"nuke",param:"'+localId+'"})\'>Nuke</p>');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" style="color:green;" onclick=\'if(confirm("Bless '+toName+'?"))socket.emit("command",{type:"bless",param:"'+localId+'"})\'>Bless</p>');
	}
		 document.body.onmouseup = (e) => {
			if(e.target.id !== 'context_'+localId && document.getElementById('context_'+localId) != null)document.getElementById('context_'+localId).style.display='none';
		};
    return false;
  }
}
function updateUsers(){
  userAmt = bonzislist.length;
  $("#users_online").html(userAmt);
}
function urlify(text) {
	if(text.includes('<img class="user_img"') || text.includes('<video class="user_vid"'))return text;
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="'+url+'" target="_blank">'+url+'</a>';
  });
}
function txtDuration(txt){
	var wordsPerMinute = 80;
    var words = txt.split(' ').length;
    if(words < 2 && txt.length > 20){
      wordsPerMinute = 10;
    }
    if(words < 2 && txt.length > 70){
      wordsPerMinute = 4;
    }
    var approximateDuration = (words / wordsPerMinute) * 60 * 1000; 
	
	return approximateDuration;
}
function screenbonzis(properties){
  var bonziselect = "";
  for(i=0;i<bonzislist.length;i++){
    if(bonzislist[i].id == properties.id){
      bonziselect = bonzislist[i];
    }
  }
  return bonziselect;
}
 var randompos = (type) => {
      var maxh = $(window).height() - 180 - 30;
      var maxw = $(window).width() - 180;
      
      var newx1 = Math.floor(Math.random() * maxw);
      var newy1 = Math.floor(Math.random() * maxh);
      if(type == "x"){
        return newx1 + "px";
      }
      if(type == "y"){
        return newy1 + "px";
      }
    };
function resetUsers(userlist) {
    bonzislist.forEach(bonziData => {
        let ids = [bonziData.id, 'name_'+bonziData.id, 'chat_'+bonziData.id, 'point_'+bonziData.id];
        ids.forEach(id => { let el = document.getElementById(id); if(el) el.remove(); });
        for(let i = 1; i <= 5; i++) {
            let h = document.getElementById('hat'+i+'_'+bonziData.id);
            if(h) h.remove();
        }
    });
    bonzislist = [];

    userAmt = userlist.length;
    for(let i = 0; i < userAmt; i++) {
        var newuser = new bonzi(userlist[i].color, randompos("x"), randompos("y"), {name: userlist[i].name, id: userlist[i].id, tag: userlist[i].tag||"", hats: userlist[i].hats||[], firstJoin: true});
        newuser.queue = bonzislist.length;
        bonzislist.push(newuser);
    }
    updateUsers();
}
let disconnectErr = true;


function reconnect(newRoom) {
	let loginLoop = () => {
		disconnectErr=false;
		socket.off('disconnect');
		listenerNames.forEach(listenName => {socket.off(listenName);});
		resetUsers([]); 
		setTimeout(() => {  login(newRoom); setTimeout(() => { if(!socket.connected)loginLoop(); },1000); },1000);
		disconnectErr=true;
	};
	loginLoop();
}

let mainAudio = new Audio();
let mainSrc = "";


let musicList = [];
					let loadedMusic = loadArray('objectsmusic');
					// FIX: Safely initialize musicList with null check
					musicList = (typeof loadedMusic == 'object' && loadedMusic !== null) ? loadedMusic : [];
					if(musicList == null)musicList=[];
					if(typeof musicList.length == 'undefined')musicList=[];
					let lastId='';
					let currentId='';
					let playSong = (songSrc,songId) => {
						if(currentId == ''){currentId=songId;}
						else {
							lastId=currentId;
							currentId=songId;
						}
						
						if(lastId.length > 0)document.getElementById(lastId).style.background='initial';document.getElementById(lastId).style.color='white';
						if(currentId.length > 0){
							currentId=songId;document.getElementById(currentId).style.color='lime';
							document.getElementById(currentId).style.background='black';
							mainAudio.src = songSrc;
						}
						
					};
					function updateList() {
						saveArray('objectsmusic',musicList);
						document.getElementById('musicplaylist').innerHTML='';
						if(typeof musicList != 'object' || musicList == null)return;
						musicList.forEach((musicObject,i) => {
							document.getElementById('musicplaylist').insertAdjacentHTML('beforeend','<p class="optionmusic" id="'+musicObject.name.substring(0,3)+'" onclick="playSong(musicList['+i.toString()+'].src,this.id);">'+musicObject.name+'&nbsp;&nbsp;&nbsp; || <span onclick="musicList.splice('+i.toString()+',1); updateList();">🗑️</span></p>');
						});
						
					};
socket.on("err",(errorTxt)=>alert(errorTxt));
  let typingStatus = {
	  focused:false,
	  typed:false,
	  timeout:undefined
  };
let roomModify = {
	public:false	
};

function login(newRoom){
	socket.connect();
	if(typeof newRoom == 'undefined')newRoom=$("#login_room").val();
	listenerNames.forEach(listenerName => {socket.off(listenerName);});
	Object.keys(applets).forEach(appletName => {
		let currentApplet = applets[appletName];
		document.getElementById(currentApplet.buttonId).onclick = () => {
			if(!currentApplet.open){
				currentApplet.onpress();
			}
		};
	});
	document.getElementById('chat_start').onclick = () => {
		if(document.getElementById('startmenu').style.display == 'none')document.getElementById('startmenu').style.display = 'flex';
		document.getElementById('content').onmouseup = (e) => {
			if (!document.getElementById('startmenu').contains(e.target)) {
				document.getElementById('startmenu').style.display = 'none';
			}
		};
	};
  $("#login_card").hide();
  $("#login_load").show();
 socket.emit("login", { 
    name: String($("#login_name").val()).substring(0, 64), 
    room: typeof newRoom === 'string' ? newRoom.substring(0, 64) : ""
});


  document.getElementById("chat_message").onfocus = () => {typingStatus.focused=true;};
  document.getElementById("chat_message").onblur = () => {typingStatus.focused=false;};
  document.getElementById("chat_message").onkeydown = (e) => {
	if(typingStatus.focused){
		if(!typingStatus.typed)socket.emit('typing',1);
		typingStatus.typed=true;
		if(typeof typingStatus.timeout != 'undefined'){clearTimeout(typingStatus.timeout); typingStatus.timeout = undefined;}
	}
    if(e.key == 'Enter') sendMsg();
  };
  document.getElementById("chat_message").onkeyup = (e) => {
	typingStatus.timeout = setTimeout(() => {socket.emit('typing',0);typingStatus.typed=false;},2000);
    if(e.key == 'Enter') sendMsg();
  };
  
  var clickhandlers = [
    {id: "#chat_send", func: () => {
      sendMsg();
    }},
	{id: "#bonzivm_start", func: () => {
      window.bonziVMsrc="none";
		if(document.body.innerHTML.includes('id="bonzivmcontainer">')){errs["applet_open"](); return;}
			let newWidth = 800;
			let newHeight = 600;
			if(isMobile()){newWidth=300; newHeight=650;};
            new Dialog({title:"BonziVM",width:newWidth,height:newHeight,html:`
			<style>.server {
    background: #7d4eba;
    background: linear-gradient(0deg, rgba(125, 78, 186, 1) 24%, rgba(158, 84, 255, 1) 76%, rgba(199, 156, 255, 1) 92%, rgba(177, 130, 237, 1) 98%);
    border: 1px solid purple;
    border-radius: 3px;
    padding: 3px;
    color: white;
    text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.65));
}</style>
			<div style="width:100%;height:100%;overflow-x:scroll;overflow-y:scroll;display:none;" id="bonzivmcontainer">
			<iframe id="bonzivm_output" width="${newWidth}" height="${newHeight}" style="display:none;"></iframe></div>
<div id="mainmenu_vm" onclick="serverstatus.innerHTML='Selected server: '+window.bonziVMsrc;" style="background: #d3b5f7;
background: radial-gradient(circle, rgba(211, 181, 247, 1) 0%, rgba(174, 113, 252, 1) 39%, rgba(158, 84, 255, 1) 86%);">
    <p id="serverstatus">Selected server: none</p>
    <button class="server" onclick="
        mainmenu_vm.style.display='none';
        bonzivm_output.style.display='block';
		document.getElementById('bonzivmcontainer').style.display='block';
        if(!window.bonziVMsrc.includes('bonzi.gay')){bonzivm_output.src = window.bonziVMsrc;}
        else{
        bonzivm_output.srcdoc='<h2>This server has an exception to open in a seperate window, due to chrome security policy.</h2>';
        window.open(window.bonziVMsrc,'BonziVM','width=600, height=480');
        }">Run VM</button>
    <hr>
    <button  class="server" onclick="window.bonziVMsrc='https://bonzi.gay';">
    <h2>Bonzi.Gay</h2>
    <hr>
    Erik's standard BonziWORLD. Opens in a chrome tab due to his WASM addiction.
    </button>
    <button onclick="window.bonziVMsrc='https://bonziworld.eu/';">
    <h2>BwiWORLD</h2>
    <hr>
    An enhanced fork of BiaWORLD edited by UnrealSticky
    </button>
     <button class="server" onclick="window.bonziVMsrc='https://bonziworldxp2.onrender.com';">
    <h2>BonziWORLD 2</h2>
    <hr>
    This server (just in case you didn't know)
    </button>
    <hr>
    <input type="text" placeholder="Custom BonziWORLD URL" id="customurl"><button onclick="window.bonziVMsrc=customurl.value;">Submit</button>
    <br>
    <p>Optionally, input a BonziWORLD server URL and BonziVM will attempt to run it</p>
</div>
`});
    }},
    {
		id:'#notepad_start',
		func:()=>{
			if(document.body.innerHTML.includes('id="notepad"')){errs["applet_open"](); return;}
			new Dialog({title:"Notepad",width:'400',height:'300px',html:`
        		<textarea id="notepad" style="width:100%;height:300px;"></textarea>
				<button onclick="eval(document.getElementById('notepad').value)">Run</button>
      		`});
			
		}
	},
	{id: '#info_icon',func:()=>{
		new Notify({
			title:'Welcome',
			body:'This is a beta/prototype of BonziWORLD XP, the next generation of BonziWORLD. Please note there may be glaring bugs or issues as this server was made from scratch in like 2 nights.',
			parent:'info_icon'});
	}},
	{
		id:'#musicplayer_start',
		func:()=>{
			if(document.body.innerHTML.includes('id="musicname">')){errs["applet_open"](); return;}
			new Dialog({title:"Music Player",width:'360',height:'380',html:`
			    <div style="width:100%;height:100%;overflow:hidden;padding:0;background: rgb(31 65 98);color: white;">
				
				
				
				<div style="border:1px solid gray;width:300px;height:200px;overflow-y:scroll;overflow-x:hidden;" id="musicplaylist">
				
				</div>
				<div style="background-image: linear-gradient(rgb(105, 163, 212) 0%, white 7%, rgb(163 190 239) 49%, rgb(146, 170, 221) 50%, rgb(66, 100, 190) 100%);
    height: 140px;
    padding: 8px;">
				
				<button class="mediacontrol" onclick="mainAudio.play();" style="
					width: 40px;
					height: 40px;
				">▶</button>
				<button class="mediacontrol" onclick="mainAudio.load();">◼️</button>
				<hr>
				<input type="text" id="musicname" placeholder="Music name"><input type="text" id="musicurl" placeholder=".mp3 or .wav URL"><br>
				<button id="musicadd">+ Music</button>
				
				</div>
				
				</div>
			`});
			
					updateList();
					document.getElementById('musicadd').onclick = () => {
						musicList.push({
							name:document.getElementById('musicname').value.length < 1 ? "Untitled" : document.getElementById('musicname').value,
							src:document.getElementById('musicurl').value
						});
						document.getElementById('musicname').value = '';
						document.getElementById('musicurl').value = '';
						updateList();
					};
		}
	}
  ];
  for(i = 0; i < clickhandlers.length; i++){
	  let functions = clickhandlers[i].func;
    document.getElementById(clickhandlers[i].id.substring(1)).onclick = () => {functions();};
  }
	
  socket.off('msg');
  socket.off('typing');
  socket.off('command');

  socket.on("room", (data) => {
    $("#page_login").hide();
    $("#room_public").hide();
    $("#room_private").hide();
    $("#room_owner").hide();
	$("#room_id").text(data.room);
    if(data.isPublic){
      $("#room_public").show();
      $("#room_id").text(data.room);
    } else {
      $("#room_private").show();
      $("#room_id").text(data.room);
    }
    if(data.isOwner){
      $("#room_owner").show();
	  $('#room_toggle').css({'display':'block'});
	  $('#room_toggle').click(() => {
		  roomModify.public=!roomModify.public;

		  let s = 'off';
		  if(roomModify.public)s='on';

		  socket.emit('command',{type:'roompublic',param:s});
	});
    }
  });
  socket.on("userlist", (data) => {
	document.getElementById('users_online').innerText = data.list.length;
	resetUsers(data.list);
  });
  socket.on("newuser", (data) => {
	document.getElementById('users_online').innerText = parseInt(document.getElementById('users_online').innerText)+1;
    var newuser = new bonzi(data.color,randompos("x"),randompos("y"),{name: data.name, id: data.id, tag: data.tag||"", hats: data.hats||[],firstJoin: true});
	newuser.queue = bonzislist.length;
    bonzislist.push(newuser);
  });
  socket.on("leave", (data) => {
	  console.log(data);
	if(typeof screenbonzis({id:data.id}).leave == "function")screenbonzis({id:data.id}).leave();
	setTimeout(() => {updateUsers();},3000);
  });
  socket.on("msg", (data) => {
	
    let thisbonzi = screenbonzis({id: data.id});

	let newMsg = urlify(data.msg.replaceAll('{NAME}',thisbonzi.name).replaceAll('{COLOR}',thisbonzi.color));
	
    if(!thisbonzi.mute)newLog({name:thisbonzi.name, msg:newMsg, quote: data.quote || null});
    thisbonzi.talk({text: newMsg, quote: data.quote || null});
  });
  socket.on("userEvent", (data) => {
	  let thisbonzi = screenbonzis({id:data.id});
	  let eventList = data.events;
	  thisbonzi.parseEvents(eventList);
  });
  socket.on("asshole", (data) => {
    let thisbonzi = screenbonzis({id: data.by});
	let queue = ["Hey, " + data.to + "!","You're a fucking asshole!"];
    queue.forEach((queueText,i) => { setTimeout(() => { thisbonzi.talk({text:queueText});},(i-0.2)*txtDuration(queueText)); });
  });
  socket.on("bass", (data) => {
    let thisbonzi = screenbonzis({id: data.by});
	let queue = ["Hey, " + data.to + "!","You're a fucking bass!"];
    queue.forEach((queueText,i) => { setTimeout(() => { thisbonzi.talk({text:queueText});},(i-0.2)*txtDuration(queueText)); });
  });
  socket.on("updateUser", (data) => {
    let n = data.name;
	let oldBonzi = screenbonzis({id: data.id});
    if(data.name !== ""){data.name = n}
    if(typeof data.level == "number")myLevel = data.level;

	let indicator = data.typing == true ? ' (...)' : '';
    screenbonzis({id: data.id}).update({name: data.name+indicator,typing:data.typing, color: data.color, id: data.id, tag: data.tag||"", hats: data.hats||[],firstJoin:false});
  });
  socket.on("nuke",(data)=>{
    let nuketarget = screenbonzis({id:data.id});
	let positioning = document.getElementById(data.id).getBoundingClientRect();
	insertNuke(positioning.x,positioning.y,nuketarget.color);
	setTimeout(() => {nuketarget.leave(true);},1);
  });
  disconnectHandle =  () => {
	setTimeout(() => {reconnect(myRoom); },2000);
	if(document.body.innerHTML.includes('<h4>BonziWORLD.exe has encountered an error') || !disconnectErr)return;
    new Dialog({title:'Error',html:`
		<img src="./img/error/logo.png"><br>
		<h4>BonziWORLD.exe has encountered an error and needs to close.</h4>
		<br>
        Nah, but seriously there was an error and you got disconnected from the server. 
		Chances are, your internet just died out for a brief moment or your device went to sleep. 
		Otherwise the server just screwed up.<br>
        <br>
        Try and reload the page. If that doesn't work and your internet is okay, then panic. 
		We'll probably be back up Soon™ though.<br>
        <br>
        <a href="#" onclick="window.location.reload()">Reload?</a><br>
	`})
  };
  socket.on("disconnect",disconnectHandle);
   
  if(profileList[0].godmodePass !== null)socket.emit('command',{type:'godmode',param:profileList[0].godmodePass});
  
}
