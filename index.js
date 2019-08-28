const Discord = require('discord.js');
const couldbetoken = require("./recipe.json");
const config = require("./config.json");
const setting = require("./settings.json");

const client =  new Discord.Client();

client.on('message', async (message) => {

    if(message.author.bot) return;

    if(message.content.indexOf(setting.prefix) !== 0) return;

    const args = message.content.slice(setting.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();    

    if(command === "alive") {
       message.channel.send(`I sure am! ${message.member}`);
    }

    if(command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
	}

 	if(!command === "create") return;
 	if(!message.member) return;
 	var test;
 	for(var bundle of config){
 		if(bundle.guild == message.guild.id) {
 			test = bundle;
 			break;
 		}
	 }
	 
	 message.guild.createChannel(
		`${message.member.displayName}'s voicechannel!`,
		"voice",
		[
			{
				type: "member",
				id: message.member.id,
				allow: 17825808
			},
			{
				type: "role",
				id: message.guild.defaultRole,
				deny: 1024
			}
		],
		(`Created by ${message.member.displayName} via ${setting.prefix}create command`)
	)
		.catch(error => console.log(error))
		.then(channel=>{
			deleteEmptyChannelAfterDelay(channel);
			channel.setParent(config[0].category)
				.catch(error => console.log(error))
				.finally(function(){
					channel.setPosition(message.guild.channels.get(config[0].category).children.size - config[0].position)
						.catch(error => console.log(error))
						.finally(function(){
							channel.permissionOverwrites.get(message.guild.defaultRole.id).delete()
								.catch(error => console.log(error))
								.then(function(){
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

 function deleteEmptyChannelAfterDelay(voiceChannel, delayMS = 12000){
 	if(!voiceChannel) return;
 	if(voiceChannel.members.first()) return;
 	if(!voiceChannel.health) voiceChannel.health = 0;
 	voiceChannel.health += 1;
 	setTimeout(function(){
 		if(!voiceChannel) return;
 		if(voiceChannel.members.first()) return;
 		voiceChannel.health -= 1;
 		if(voiceChannel.health > 0) return;
 		voiceChannel.delete()
 			.catch(error => console.log(error));
 	}, delayMS);
 }

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });

client.login(couldbetoken.nottoken);