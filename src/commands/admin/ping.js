module.exports = {
	name: "ping",
	category: "botinfo",
	description: "Returns bot and API latency in milliseconds.",
	execute: async (message, args, client) => {
         	message.channel.send({content: 'Loading Data'}).then(async(msg) =>{
        	msg.edit(`🏓Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        })
	},
};
