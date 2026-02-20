var socket = io(location.href);
var first = true;
var userAmt = 0;
var userlist = [];
var bonzislist = [];
var mousex = 0;
var mousey = 0;
var logtxt = `
	<i>Welcome to BonziWORLD XP</i>
	<hr>
`;

let applets = {
	"settings":{
		buttonId:"my_bonzi",
		open:false,
		onpress:()=>{
            new Dialog({title:"Settings",width:'400',height:'480',html:`
				<div style="width:790px;height:590px;overflow-y:scroll;overflow-x:hidden;">
				
				Color:<br>
				<div id="row_color1" style="display:flex;flex-direction:row;">
					
				</div>
				<div id="row_color2" style="display:flex;flex-direction:row;">
					
				</div>
				<hr>
				Name:<br>
				<input type="text" placeholder="Username" id="usernameswap"><button onclick="socket.emit('command',{type:'name',param:document.getElementById('usernameswap').value});">Set Name</button>
				
				</div>
			`});
			let clrs = ['red','brown','green','blue','purple','pink','black'];
			let currentRow = 1;
			for(let i=0;i<clrs.length;i++){
				if(i >= clrs.length/2)currentRow=2;
				
				document.getElementById('row_color'+currentRow).insertAdjacentHTML('beforeend',`
					<button onclick="socket.emit('command',{type:'color',param:'${clrs[i]}'});">
						<div style="width:75px;height:75px;background-image:linear-gradient(white,${clrs[i].replaceAll('pink','magenta').replaceAll('purple','indigo')});"></div>
					</button>
				`);
			}
		},
	},
	"bonzilog":{
		buttonId:"bonzi_log",
		open:false,
		onpress:()=>{
            new Dialog({title:"BonziLOG",width:'275',height:'500',html:`
			<div style="width:100%;height:100%;overflow-x:hidden;overflow-y:none;" id="log_contents">
				${logtxt}
			</div>
			`});
		}
	}
};

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
  var toggleBtn = document.createElement("div");
  toggleBtn.id = "icon_toggle_btn";
  toggleBtn.innerHTML = "&#9776;";
  toggleBtn.style.cssText = "position:fixed;bottom:50px;right:8px;z-index:99999;background:rgba(0,0,0,0.55);color:white;font-size:22px;width:36px;height:36px;display:none;align-items:center;justify-content:center;border-radius:5px;cursor:pointer;user-select:none;";
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
    $("#page_mobile").show();
  }
  $("#login_card").show();
  $("#login_load").hide();
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
        socket.emit("login", {name: $("#login_name").val(), room: $("#login_room").val()});
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
	document.getElementById('log_contents').innerHTML = logtxt;
}
function newLog(options){
	logtxt+=`
		<b>${options.name}:</b>${options.msg}<hr>
	`;
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
function sendMsg(){
  var msg = $("#chat_message").val();

  if(msg.startsWith("/")){
    var cmdtype = msg.substring(1, msg.indexOf(" "));
    var param = msg.substring(msg.indexOf(" ") + 1, msg.length);
    console.log(cmdtype +" "+param);
    socket.emit("command",{type: cmdtype, param: param})
  } else {
    socket.emit("msg",{msg: msg});
  }
  $("#chat_message").val("")
}
function notif(head, body, top, left, type){
  let localId = Id(10);
  console.log("bla")
  $("#content").append("<div class='notif' id='"+localId+"' style='top:"+top+";left:"+left+";'><div class='notif_cont'><h3 class='notif_header'>"+head+"</h3><div class='body'>"+body+"</div></div></div>");
  document.body.onresize = () => {
    var info = document.getElementById("info_icon").getBoundingClientRect().x - 330;
    var info2 = $(window).height() - 140;
    var infox = info + "px";
    var infoy = info2 + "px";
    if(type == "info")
    $("#"+localId).css({
       "top": infoy,
       "left": infox
    });
  }
  setTimeout(() => { $("#"+localId).remove(); },6000)
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
let colorCache = {
  "/img/bonzi/red.png":null,
  "/img/bonzi/green.png":null,
  "/img/bonzi/blue.png":null,
  "/img/bonzi/purple.png":null,
  "/img/bonzi/pink.png":null,
  "/img/bonzi/black.png":null,
  "/img/bonzi/brown.png":null,
  "/img/bonzi/bcn.png":null,
  "/img/bonzi/smile.png":null,
};
function bonzi(colorurl,left,top,property){
  console.log(property);
  var width = 200;
  var height = 160;
  var rows = 21;
  var columns = 17;
  var localId = property.id;
  this.mute = false;

  if(property.pitch == undefined){
    property.pitch = 80;
  }
  if(property.speed == undefined){
    property.speed = 150;
  }
  content.insertAdjacentHTML('beforeend',`
  <div id='name_${localId}' style='position:absolute;' class='bonzi_name'>${property.name}</div><canvas class='bonzi_canvas' width='200' height='160' style='position:absolute;top:${top};left:${left};' id='${localId}'></canvas><div id='chat_${localId}' class='bubble_chat'><div class='msg_cont'>Test Message</div></div><div id='point_${localId}' class='bubble_point'></div>
  `);
  $("#chat_"+localId).hide();
  $("#point_" + localId).hide();
  
  var canvas = document.getElementById(localId);
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var draw = (x,y) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  }
  var animate = (properties) => {
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
    if(properties.type == "smile"){
      let x = width * 11;
      let y = height * 11;
      var col = columns * width - width - width;
      var row = y;
      var anim = setInterval(() => {
        if(x > col){x = 0; y+=height;}
        
        draw(x,y);
        x+=200;
      },80);
      setTimeout(()=>{clearInterval(anim)},3000);
    }
    if(properties.type == "enter"){
      let x = width * 11;
      let y = height * 11;
      var col = columns * width - width - width;
      var row = y;
      var anim = setInterval(() => {
        if(x > col){x = 0; y+=height;}

        draw(x,y);
        x+=200;
      },80);
      setTimeout(()=>{clearInterval(anim)},3000);
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
  }
  var talk = (properties) => {
	 
    if(this.mute == true){
      return;
    }
    $("#chat_" + localId).show();
    $("#point_" + localId).show();
    $("#chat_" + localId).html(properties.text);

    var wordsPerMinute = 80;
    var words = properties.text.split(' ').length;
    if(words < 2 && properties.text.length > 20){
      wordsPerMinute = 10;
    }
    if(words < 2 && properties.text.length > 70){
      wordsPerMinute = 4;
    }
    var approximateDuration = (words / wordsPerMinute) * 60 * 1000; 
    speak.play(properties.text, { pitch: property.pitch, speed: property.sped });

    $("#bworg").click(() => {
      window.open("https://bonziworld.org","_blank");
    });
    setTimeout(() => {
      if(!properties.text.startsWith("-")){
        $("#chat_" + localId).hide();
        $("#point_" + localId).hide();
        
      } else {
        setTimeout(() => {
          $("#chat_" + localId).hide();
          $("#point_" + localId).hide();
        },approximateDuration * 20);
      }
    }, approximateDuration);

  } 
  var update = (properties) => {
    $("#name_" + localId).html(properties.name);
    img.src = properties.color;
    draw(0,0);
    animate({type: "idle"});
  }
  var joke = (queue) => {
    var jokeopen = [
      {jokeloop: () => {
       socket.emit("msg", {msg: "Yeah, of course {NAME} wants me to tell a joke."});
        setTimeout(() => {socket.emit("msg",{msg: "Haha, look at the stupid {COLOR} monkey telling jokes!"});},5700)
      }}
    ];

    
  }
  this.leave = () => {
	   document.getElementById(localId).remove();
   	document.getElementById("name_" + localId).remove();
    document.getElementById("chat_" + localId).remove();
    document.getElementById("point_" + localId).remove();
	  
	  bonzislist.splice(screenbonzis({id:localId}).queue,1);
	  bonzislist.forEach((currentBonzi,i) => {bonzislist[i].queue=i;});
  };
  this.animate = animate;
  this.move = move;
  this.draw = draw;
  this.talk = talk;
  this.update = update;
  this.joke = joke;

  var left = document.getElementById(localId).style.left;
  var top = document.getElementById(localId).style.top;
  var pos = {x: left, y: top};

  this.left = pos.x;
  this.top = pos.y;
  this.id = localId;
  this.name = property.name;
  console.log("Bonzi initialized");
  img.src = colorurl;
  img.onload = function() {
    draw(0,0);
    var yInt = parseInt(document.getElementById(localId).style.top);
    var xInt = parseInt(document.getElementById(localId).style.left);
    move({x: xInt, y: yInt})
  }
  var mousestat = "up";

  var touchDragActive = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var bonziStartX = 0;
  var bonziStartY = 0;

  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
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
    var hidectx = () => {$("#context_" + localId).hide();{$("#context_" + localId).remove();}}
    var parsetop = parsetop1 + 50;
    setInterval(() => {
    if(!$(".context_menu").click() && $("#context").click()){
      alert("rrrrr")
    }
    });
    $(".bonzi_canvas").on("mousedown", hidectx);
    $(".icon").click(hidectx);
    $("#chat_message").click(hidectx);
	let toName = screenbonzis({id:localId}).name;
	if(toName.includes('<i style=') && toName.includes('</i>')){
		toName = toName.substring(toName.indexOf('>'),toName.length);
		toName = toName.substring(0,toName.indexOf('<'));
	}
	$("#content").append(`
		<div class='context_menu' id='context_${localId}' style='top:${parsetop}px; left: ${document.getElementById(localId).style.left}'>
			<p class="context_text" id="${localId}_asshole" onclick='socket.emit("command",{type:"asshole",param:"${toName}"});'>Call an asshole</p>
		</div>`);
    return false;
  }
}
function updateUsers(){
  userAmt = userlist.length;
  $("#users_online").html("Users online: "+userAmt);
}
function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="'+url+'">'+url+'</a>';
  })
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
    [...bonzislist].forEach(bonziData => {
        screenbonzis({id: bonziData.id}).leave();
    });
    bonzislist = [];
    
    userAmt = userlist.length;
    for (i = 0; i < userAmt; i++) {
        var newuser = new bonzi(userlist[i].color, randompos("x"), randompos("y"), {name: userlist[i].name, id: userlist[i].id});
        newuser.queue = bonzislist.length;
        bonzislist.push(newuser);
    }
    updateUsers();
}
let listenerNames = ["msg","asshole","userlist","leave","newuser","room"];
function reconnect(){
	resetUsers([]);
	socket.connect();
	let loginSuccess = false;
	let loginLoop = () => {
		login();
		loginSuccess = bonzislist.length > 0;
		if(!loginSuccess)setTimeout(loginLoop,5000);
	};
	setTimeout(loginLoop,2000);
}
function login(){
	listenerNames.forEach(listenerName => {socket.off(listenerName);});
	if(!socket.connected)socket.connect();
	Object.keys(applets).forEach(appletName => {
		let currentApplet = applets[appletName];
		document.getElementById(currentApplet.buttonId).onclick = () => {
			if(!currentApplet.open){
				currentApplet.onpress();
			}
		};
	});
	document.getElementById('chat_start').onclick = () => {
		document.getElementById('startmenu').style.display = 'flex';
		document.body.onmouseup = (e) => {if(e.target.id !== 'startmenu')document.getElementById('startmenu').style.display='none';};
	};
  $("#login_card").hide();
  $("#login_load").show();
  socket.emit("login",{name: $("#login_name").val(), room: $("#login_room").val()});

  document.getElementById("chat_message").onkeyup = (e) => {
    if(e.key == 'Enter') sendMsg();
  };
  var clickhandlers = [
    {id: "#chat_send", func: () => {
      sendMsg();
    }}
  ];
  for(i = 0; i < clickhandlers.length; i++){
	  let functions = clickhandlers[i].func;
    document.getElementById(clickhandlers[i].id.substring(1)).onclick = () => {functions();};
  }

  socket.on("room", (data) => {
    $("#page_login").hide();
    $("#room_public").hide();
    $("#room_private").hide();
    $("#room_owner").hide();
    if(data.isPublic){
      $("#room_public").show();
      $(".room_id").text("default");
    } else {
      $("#room_private").show();
      $(".room_id").text(data.room);
    }
    if(data.isOwner){
      $("#room_owner").show();
    }
  });
  socket.on("userlist", (data) => {
	resetUsers(data.list);
  });
  socket.on("newuser", (data) => {
    var newuser = new bonzi(data.color,randompos("x"),randompos("y"),{name: data.name, id: data.id});
	newuser.queue = bonzislist.length;
    bonzislist.push(newuser);
  });
  socket.on("leave", (data) => {
	screenbonzis({id:data.id}).leave();
  });
  socket.on("msg", (data) => {
	console.log(data);
    let thisbonzi = screenbonzis({id: data.id});
	let newMsg = urlify(data.msg.replaceAll('{NAME}',thisbonzi.name).replaceAll('{COLOR}',thisbonzi.color));
	
    newLog({name:thisbonzi.name,msg:newMsg});
    thisbonzi.talk({text: newMsg});
  });
  socket.on("asshole", (data) => {
	  console.log(data);
    let thisbonzi = screenbonzis({id: data.by});
	let queue = ["Hey, " + data.to + "!","You're a fucking asshole!"];
    queue.forEach((queueText,i) => { setTimeout(() => {console.log(queueText); thisbonzi.talk({text:queueText});},(i-0.2)*txtDuration(queueText)); });
  });
  socket.on("updateUser", (data) => {
    var n = data.name;
    if(data.name !== ""){data.name = n}
    screenbonzis({id: data.id}).update({name: data.name, color: data.color, id: data.id});
  });
socket.on("err",(errorTxt)=>alert(errorTxt));
  socket.on("disconnect", () => {
	if(document.body.innerHTML.includes('<h4>BonziWORLD.exe has encountered an error'))return;
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
  });
   
  
  
}
