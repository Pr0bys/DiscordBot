const Discord = require('discord.js');
const client = new Discord.Client();

client.on("ready", () => {
    console.log(`${client.user.tag } is now online and ready to use`);  
});
  
client.login("OTAwOTc5NTI1NTI4MTk1MDcy.Gs7RG8.GtbvIAbXiux6MeO7XK3esLCdQ2dVpmUH89HGVA");

const prefix="#";

client.on("message", async (message) =>{
    if(!message.guild) return;
    if(message.author.bot) return;
    const args = message.content.slice(prefix.length).split(" ");
    console.log("ARGS:"+args);
    const command = args.shift();

    if(message.content[0] === prefix){
        if(command === "send"){
            message.channel.send("!ban");
        }
    }
})