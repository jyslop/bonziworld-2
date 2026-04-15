a) => {
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
	setTimeout(() => {if(disconnectErr){reconnect();} },2000);
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
