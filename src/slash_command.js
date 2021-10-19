const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {Client, Intents} = require('discord.js');
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

const fs = require('fs');

const commands = [];
// Place your client and guild ids here
const clientId = '886060953362366464';
const guildId = '695633766575636491';

var commandFolders = fs.readdirSync("./src/commands");

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		if(command.data){
			const data = command.data.toJSON()
			commands.push(data);
			}
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
	
})();
