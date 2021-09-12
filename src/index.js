require('dotenv').config(); 
const fs = require('fs');
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const json = require('../config.json')
discordClient.commands = new Discord.Collection();



var commandFolders = fs.readdirSync("./src/commands");

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		discordClient.commands.set(command.name, command);
	}
}


discordClient.once('ready', async () => {
		console.log(
			
				`[!] Username: ${discordClient.user.username}` +
				`\n[!] ID: ${discordClient.user.id}` +
				`\n[!] Guild Count: ${discordClient.guilds.cache.size}` + 
				`\n[!] Commands: ${discordClient.commands.size}` +
				`\n[!] Bot is online`

		)
});

//COMMANDS
discordClient.on('message',async message => {

	const prefix = '!'

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = discordClient.commands.get(commandName)
		|| discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('You cannot use the ' + command.name + ' command');
		}
	}

	if(command.user){
		if(command.user[0] != message.author.id && command.user[1] != message.author.id ){
			return
		}
	}
	
	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	try {
		command.execute(message, args, discordClient);
		
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

discordClient.on('guildMemberRemove', async (member) => {

})
  
discordClient.on('guildMemberAdd', async (member) => {
	
	const embed = new Discord.MessageEmbed()
	.setTitle('Welcome to the ANZGC Disney Arena server!')
	.setDescription(`You only have the drop zone channel available at this stage.

	Please standby for one of our team to arrive and assist you. Meanwhile say hello, post your DSA profile and tell us what you are looking for
	`)
	.setThumbnail('https://images-ext-2.discordapp.net/external/ZcnQRqa7obo0-DZA1-ZC-YHPxTm0iB6QedF20o28WqE/https/media.discordapp.net/attachments/695952520614379550/695954117637439539/Screenshot_20200405-001249_Gallery.jpg')
	
    const channelId = json.welcomeChannel
	const channel = member.guild.channels.cache.get(channelId)
	channel.send('<@' + member.user.id + '> has joined the server <@&' + json.Roles.ThePride + '> <@&' + json.Roles.RecruitingTeam + '>', {embed: embed});
	member.roles.add(json.Roles.DropZone)
	member.send(
	`Hello! Welcome to ANZGC. Please standby for one of our Recruiters to assist you in finding the best club for you.+

**In the meantime, please**
1) Post your profile in <#${json.welcomeChannel}>
2) Tell us what you are looking for in a club 

**If you are looking to access our Server:**
Only Members of ANZGC Members from Star Wars Galaxy of Heroes and Marvel Strike Force are allowed to have the friends role and other players will be decided by The Pride.

Please DM <@716206954313285713> if you are not able to see any channels in our DSA Server

Hope you find a club that suits your needs
	`)

})

discordClient.login(process.env.TOKEN)
