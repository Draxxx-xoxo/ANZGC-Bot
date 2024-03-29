require('dotenv').config(); 
const fs = require('fs');
const {Client, Intents} = require('discord.js');
const Discord = require('discord.js');
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const json = require('../config.json')
discordClient.commands = new Discord.Collection();
const slash_command = require('./slash_command')
const wait = require('util').promisify(setTimeout);



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
discordClient.on('messageCreate', async message => {

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

discordClient.on('guildMemberAdd', async (member) => {

	if(member.user.bot) return;

	if(json.welcomeChannel == member.guild.channels.cache.get(json.welcomeChannel)){
	
	const embed = new Discord.MessageEmbed()
	.setTitle(json.addmemberembed.Title)
	.setDescription(json.addmemberembed.Description)
	.setThumbnail('https://images-ext-2.discordapp.net/external/ZcnQRqa7obo0-DZA1-ZC-YHPxTm0iB6QedF20o28WqE/https/media.discordapp.net/attachments/695952520614379550/695954117637439539/Screenshot_20200405-001249_Gallery.jpg')
	
    const channelId = json.welcomeChannel
	const channel = member.guild.channels.cache.get(channelId)
	channel.send({content:'<@' + member.user.id + '> has joined the server <@&' + json.Roles.ThePride + '> <@&' + json.Roles.RecruitingTeam + '>', embeds: [embed]});
	member.roles.add(json.Roles.DropZone)
	member.send({content: json.dmcontent}).catch(() => console.log("Can't send DM to your user!"));
	}

})
discordClient.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Loading Data')
		await wait(0)
		await interaction.editReply(`🏓Latency is ${new Date() - interaction.createdTimestamp}ms. API Latency is ${Math.round(discordClient.ws.ping)}ms`);
	}

	if (interaction.commandName === 'eval') {

		try{
			const result = interaction.options.getString('input').split(" ").join(" ");
            let evaled = eval(result);
            await interaction.reply({content:'```'+ evaled + '```'})
            }
        catch(error){
            console.log(error);
            interaction.reply({content: '```'+ error + '```'});
		}
		
	}

	if (interaction.commandName === 'list_role') {

		const role = interaction.guild.roles.cache.get(interaction.options.getString('role'))

		//console.log(interaction.options.getNumber('role'))

		if(!role){
			await interaction.reply('Please mention a role')
			return
		}

		const list_role = role.members.map(m=>m.user.tag + ' `' + m.user.id + '`').join('\n')

		const embed = new Discord.MessageEmbed()
		.setTitle('Members who have ' + role.name)
		.setDescription(list_role)
		.setFooter(interaction.guild.roles.cache.get(`${role.id}`).members.map(m=>m).length + ' Members with the role')
		
        
        interaction.reply({embeds: [embed]})
	}


});

discordClient.login(process.env.TOKEN)
