const Discord = require('discord.js');
const couldbetoken = require("./nottoken.json");
const config = require("./config.json");

const client =  new Discord.Client();

client.on('message', async (message) => {

    if(message.content === 'Alive?'){
        message.channel.send("Yes, I am.");
    }   

    if(message.content === 'Creator?') {
        message.channel.send(`${config.author[0]}`);
    }

    if(message.content === "Prefix?") {
        message.channel.send(`The prefix is: ${config.prefix}`);
    }

    if(message.content === "Name?") {
        message.channel.send(`My name is ${config.prefix}`);
    }

    if(message.content === "Ping?") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();    

    if(command === "test") {
       message.channel.send("Henlo?");
    }

    if(command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }
});

client.on('message', (message) => {

    if(message.content.startsWith('/create')){
        message.channel.send(`Your voicechannel will be created ${message.member}`);
    }  
     //check if message starts with "/create" 
 	if(!message.content.startsWith("/create")) return;
 	if(!message.member) return;
 	var test;
 	for(var bundle of config){
 		if(bundle.guild == message.guild.id) {
 			test = bundle;
 			break;
 		}
 	}

 	message.guild.createChannel(
 		`${message.member.displayName} voicechannel!`,
 		"voice",
 		[
 			{	//make creator of channel owner (aka gib perms)
 				type: "member",
 				id: message.member.id,
 				allow: 17825808
 			},
 			{	//hide for everyone temporarily so the channel list doesn't fucking earthquake like a diabetic after downing 3 monsters - this is a permament temporary workaround until D.JS v12 gets released
 				type: "role",
 				id: message.guild.defaultRole,
 				deny: 1024
 			}
 		],
 		(`Created by ${message.member.displayName} via /create command`)
 	)
 		.catch(error => console.log(error))
 		.then(channel=>{
 			deleteEmptyChannelAfterDelay(channel);
 			channel.setParent(config[0].category)
 				.catch(error => console.log(error))
 				.finally(function(){	//move channel in voice category
 					channel.setPosition(message.guild.channels.get(config[0].category).children.size - config[0].position)
 						.catch(error => console.log(error))
 						.finally(function(){ //move channel to correct position
 							channel.permissionOverwrites.get(message.guild.defaultRole.id).delete()
 								.catch(error => console.log(error))
 								.then(function(){ //delete overwrite for @everyone (make channel visible again)
 									channel.createInvite()
 										.catch(error => console.log(error))
 										.then((invite) => {
 											client.channels.get("321449537413578752").send(`Created ${channel.name} for ${message.member} - ${invite} <- join link to go into the VC`);
 										});
 								});
 						});
 				});
 		});

});

 client.on("voiceStateUpdate", oldMember => {
 	deleteEmptyChannelAfterDelay(oldMember.voiceChannel);
 });

 function deleteEmptyChannelAfterDelay(voiceChannel, delayMS = 10000){
 	if(!voiceChannel) return;
 	if(voiceChannel.members.first()) return;
 	if(!voiceChannel.health) voiceChannel.health = 0;
 	voiceChannel.health += 1;
 	setTimeout(function(){	//queue channel for deletion and wait
 		if(!voiceChannel) return;
 		if(voiceChannel.members.first()) return;
 		voiceChannel.health -= 1;
 		if(voiceChannel.health > 0) return;
 		voiceChannel.delete()	//delete channel
 			.catch(error => console.log(error));
 	}, delayMS);
 }

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });

client.login(couldbetoken.maybetoken);