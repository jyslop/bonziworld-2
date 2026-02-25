var socket = io(location.href);
var first = true;
var userAmt = 0;
var userlist = [];
var bonzislist = [];
var mousex = 0;
var mousey = 0;
var myLevel = 1;
function setCookie(cname,cvalue,exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
	let result = JSON.parse(loaded);
	
	return result;
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
				<div style="width:790px;height:650px;overflow-y:scroll;overflow-x:hidden;">
				
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
				<input type="text" placeholder="Username" id="usernameswap"><button onclick="socket.emit('command',{type:'name',param:document.getElementById('usernameswap').value});">Set Name</button>
				<hr>
				Hats:<br>
				<div id="hat_grid" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;width:400px;"></div>
				<button onclick="socket.emit('command',{type:'hat',param:''});" style="margin-top:6px;">Clear Hats</button>
				
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
			let hatGrid = document.getElementById('hat_grid');
			Object.keys(hatList).forEach(hatName => {
				
				hatGrid.insertAdjacentHTML('beforeend',`
					<button title="${hatName}" onclick="socket.emit('command',{type:'hat',param:'${hatName}'});" style="display:flex;flex-direction:column;align-items:center;width:70px;font-size:10px;padding:3px;">
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
		if(document.body.innerHTML.includes('id="media_upload_input"')){errs["applet_open"](); return;}
		new Dialog({title:"Images And Videos",width:'320',height:'200',html:`
			<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
				<input type="file" accept="image/*,video/*" id="media_upload_input" style="display:none;">
				<button onclick="document.getElementById('media_upload_input').click();" style="width:120px;height:120px;font-size:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;">+</button>
				<p style="font-size:12px;text-align:center;">Click to upload an image or video to Catbox</p>
			</div>
		`});
		document.getElementById('media_upload_input').onchange = (e) => {
			let file = e.target.files[0];
			if(!file)return;
			let isVideo = file.type.startsWith('video/');
			let formData = new FormData();
			formData.append('reqtype','fileupload');
			formData.append('fileToUpload',file);
			fetch('https://catbox.moe/user/api.php',{method:'POST',body:formData}).then(r=>r.text()).then(url=>{
				url = url.trim();
				if(isVideo){socket.emit('command',{type:'vid',param:url});}
				else{socket.emit('command',{type:'img',param:url});}
			});
		};
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

    socket.emit("command",{type: cmdtype, param: param})
  } else {
    socket.emit("msg",{msg: msg});
  }
  $("#chat_message").val("")
}
function notif(head, body, top, left, type){
  let localId = Id(10);
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
function bonzi(colorurl,left,top,property){
	let urlNames = {};
	let urlArrays = Object.keys(colorCache).map(r => {urlNames[colorCache[r]] = r; return colorCache[r];});
  this.color = urlArrays.some(r => r == colorurl || r.includes(colorurl)) ? urlNames[colorurl] : colorurl;
  var width = 200;
  var height = 160;
  var rows = 21;
  var columns = 17;
  var localId = property.id;
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
  <div id='name_${localId}' style='position:absolute;' class='bonzi_name'>${tagHtml} ${property.name}</div><canvas class='bonzi_canvas' width='200' height='160' style='position:absolute;top:${top};left:${left};' id='${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;' id='hat1_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;' id='hat2_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;' id='hat3_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;' id='hat4_${localId}'></canvas><canvas class='bonzi_hat_layer' width='200' height='160' style='position:absolute;top:${top};left:${left};pointer-events:none;' id='hat5_${localId}'></canvas><div id='chat_${localId}' class='bubble_chat'><div class='msg_cont'>Test Message</div></div><div id='point_${localId}' class='bubble_point'></div>
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
    for(let layerIdx = 1; layerIdx <= 5; layerIdx++){
      let hatCanvas = document.getElementById('hat'+layerIdx+'_'+localId);
      if(hatCanvas){
        hatCanvas.style.left = xInt + "px";
        hatCanvas.style.top = yInt + "px";
      }
    }
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
    img.src = properties.color;
    draw(0,0);
    animate({type: "idle"});
    if(Array.isArray(properties.hats)){
      currentHats = properties.hats;
      drawHats();
    }
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
    for(let layerIdx = 1; layerIdx <= 5; layerIdx++){
      let hatCanvas = document.getElementById('hat'+layerIdx+'_'+localId);
      if(hatCanvas)hatCanvas.remove();
    }
	  
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

  this.tag = property.tag || "";
  this.name = property.name;

  if(this.tag && this.tag.length > 0){
    var tagEl = document.getElementById("tag_" + localId);
    if(tagEl){tagEl.innerHTML = this.tag; tagEl.style.display = "inline";}
  }

  img.src = colorurl;
  img.onload = function() {
    if(img.naturalWidth === 3400 && img.naturalHeight === 3360){
      isStaticImage = false;
    } else {
      isStaticImage = true;
    }
    draw(0,0);
    drawHats();
    var yInt = parseInt(document.getElementById(localId).style.top);
    var xInt = parseInt(document.getElementById(localId).style.left);
    move({x: xInt, y: yInt})
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
	$("#content").append(`
		<div class='context_menu' id='context_${localId}' style='top:${parsetop}px; left: ${document.getElementById(localId).style.left}'>
			<p class="context_text" id="${localId}_asshole" onclick='socket.emit("command",{type:"asshole",param:"${toName}"});'>Call an asshole</p>
			<div id="ctx_mod_${localId}"></div>
		</div>`);
	var modDiv = document.getElementById("ctx_mod_"+localId);
	if(myLevel > 1){
		modDiv.insertAdjacentHTML('beforeend','<hr style="margin:2px 0;">');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" onclick=\'(function(){var t=prompt("New tag for '+toName+':");if(t!==null)socket.emit("command",{type:"modtag",param:"'+localId+' "+t});})()\'>Set tag</p>');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" onclick=\'(function(){var n=prompt("New name for '+toName+':");if(n!==null)socket.emit("command",{type:"modname",param:"'+localId+' "+n});})()\'>Set name</p>');
		modDiv.insertAdjacentHTML('beforeend','<p class="context_text" style="color:red;" onclick=\'if(confirm("Nuke '+toName+'?"))socket.emit("command",{type:"nuke",param:"'+localId+'"})\'>Nuke</p>');
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
    return '<a href="'+url+'">'+url+'</a>';
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
    [...bonzislist].forEach(bonziData => {
        screenbonzis({id: bonziData.id}).leave();
    });
    bonzislist = [];
    
    userAmt = userlist.length;
    for (i = 0; i < userAmt; i++) {
        var newuser = new bonzi(userlist[i].color, randompos("x"), randompos("y"), {name: userlist[i].name, id: userlist[i].id, tag: userlist[i].tag||"", hats: userlist[i].hats||[]});
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

let mainAudio = new Audio();
let mainSrc = "";


let musicList = [];
					let loadedMusic = loadArray('objectsmusic');
					musicList = typeof loadedMusic == 'object' ? loadedMusic : musicList; 
					
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
							}
						mainAudio.src = songSrc;
					};
					let updateList = () => {
						saveArray('objectsmusic',musicList);
						document.getElementById('musicplaylist').innerHTML='';
						musicList.forEach((musicObject,i) => {
							document.getElementById('musicplaylist').insertAdjacentHTML('beforeend','<p class="optionmusic" id="'+musicObject.name.substring(0,3)+'" onclick="playSong(musicList['+i.toString()+'].src,this.id);">'+musicObject.name+'&nbsp;&nbsp;&nbsp; || <span onclick="musicList.splice('+i.toString()+',1); updateList();">🗑️</span></p>');
						});
						
					};
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
		if(document.getElementById('startmenu').style.display == 'none')document.getElementById('startmenu').style.display = 'flex';
		document.getElementById('content').onmouseup = (e) => {
			if (!document.getElementById('startmenu').contains(e.target)) {
				document.getElementById('startmenu').style.display = 'none';
			}
		};
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
    }},
	{id: "#bonzivm_start", func: () => {
      window.bonziVMsrc="none";
		if(document.body.innerHTML.includes('id="bonzivmcontainer">')){errs["applet_open"](); return;}
			let newWidth = 800;
			let newHeight = 600;
			if(isMobile()){newWidth=300; newHeight=650;};
            new Dialog({title:"BonziVM",width:newWidth,height:newHeight,html:`
			<div style="width:100%;height:100%;overflow-x:scroll;overflow-y:scroll;display:none;" id="bonzivmcontainer">
			<iframe id="bonzivm_output" width="${newWidth}" height="${newHeight}" style="display:none;"></iframe></div>
<div id="mainmenu_vm" onclick="serverstatus.innerHTML='Selected server: '+window.bonziVMsrc;">
    <p id="serverstatus">Selected server: none</p>
    <button onclick="
        mainmenu_vm.style.display='none';
        bonzivm_output.style.display='block';
		document.getElementById('bonzivmcontainer').style.display='block';
        if(!window.bonziVMsrc.includes('bonzi.gay')){bonzivm_output.src = window.bonziVMsrc;}
        else{
        bonzivm_output.srcdoc='<h2>This server has an exception to open in a seperate window, due to chrome security policy.</h2>';
        window.open(window.bonziVMsrc,'BonziVM','width=600, height=480');
        }">Run VM</button>
    <hr>
    <button onclick="window.bonziVMsrc='https://bonzi.gay';">
    <h2>Bonzi.Gay</h2>
    <hr>
    Erik's standard BonziWORLD.
    </button>
    <button onclick="window.bonziVMsrc='https://hugboxworldrevived.onrender.com/';">
    <h2>HugboxWORLD</h2>
    <hr>
    A fucked up BonziWORLD.
    </button>
     <button onclick="window.bonziVMsrc='https://bonziworld-revived-1.onrender.com/';">
    <h2>BonziWORLD Revived Classic</h2>
    <hr>
    Seamus's shitty mutated retarded brainchild.
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
	document.getElementById('users_online').innerText = data.list.length;
	resetUsers(data.list);
  });
  socket.on("newuser", (data) => {
	document.getElementById('users_online').innerText = parseInt(document.getElementById('users_online').innerText)+1;
    var newuser = new bonzi(data.color,randompos("x"),randompos("y"),{name: data.name, id: data.id, tag: data.tag||"", hats: data.hats||[]});
	newuser.queue = bonzislist.length;
    bonzislist.push(newuser);
  });
  socket.on("leave", (data) => {
	if(typeof screenbonzis({id:data.id}).leave == "function")screenbonzis({id:data.id}).leave();
  });
  socket.on("msg", (data) => {
	
    let thisbonzi = screenbonzis({id: data.id});

	let newMsg = urlify(data.msg.replaceAll('{NAME}',thisbonzi.name).replaceAll('{COLOR}',thisbonzi.color));
	
    newLog({name:thisbonzi.name,msg:newMsg});
    thisbonzi.talk({text: newMsg});
  });
  socket.on("asshole", (data) => {
    let thisbonzi = screenbonzis({id: data.by});
	let queue = ["Hey, " + data.to + "!","You're a fucking asshole!"];
    queue.forEach((queueText,i) => { setTimeout(() => { thisbonzi.talk({text:queueText});},(i-0.2)*txtDuration(queueText)); });
  });
  socket.on("updateUser", (data) => {
    var n = data.name;
    if(data.name !== ""){data.name = n}
    if(typeof data.level == "number")myLevel = data.level;
    screenbonzis({id: data.id}).update({name: data.name, color: data.color, id: data.id, tag: data.tag||"", hats: data.hats||[]});
  });
  socket.on("nuke",()=>{
    document.body.innerHTML='<div style="background:#000;color:#0f0;font-family:monospace;padding:40px;height:100vh;box-sizing:border-box;"><h1>NUKED</h1><p>You have been nuked by a moderator.</p><a href="#" onclick="window.location.reload()" style="color:#0f0;">Reload?</a></div>';
    socket.disconnect();
  });
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
