module.exports = {
	name: "eval",
	category: "botinfo",
	description: "Returns bot and API latency in milliseconds.",
	execute: async (message, args, client) => {
        try{
            var result = message.content.split(" ").slice(1).join(" ")
            let evaled = eval(result);
            message.channel.send({content:'```'+ evaled + '```'})
            }
        catch(error){
            console.log(error);
            message.channel.send({content: '```'+ error + '```'});
        }
	},
};

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
     data: new SlashCommandBuilder()
	    .setName('eval')
	    .setDescription('evaluation')
	    .addStringOption(option =>
		    option.setName('input')
			    .setDescription('evaluation')
			    .setRequired(true))
}