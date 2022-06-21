
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
require("dotenv").config();

const fs = require('fs');

const fetch = require('node-fetch');

const client = new Discord.Client({
  restTimeOffset: 0, //changes reaction speed to 0 aka fastest
  presence:{
    status:"dnd",
    activity:{
      name: "Music use !help",
      type:"PLAYING"
    },
  }
});

const Distube = require("distube");

const { getPreview, getTracks } = require("spotify-url-info")

const distube = new Distube(client);

client.on("ready", () => {
  console.log(`${client.user.tag } is now online and ready to use`);  
});

client.login(process.env.BOT_TOKEN);

const prefix="!";
let IsPlayingPlayList = 0;

function check_connection(message){
  if(!distube.isPaused(message)){
    if(!distube.isPlaying(message)){
      message.channel.send(new MessageEmbed()
      .setTitle(`| ❌ERROR | I AM NOT PLAYING SOMETHING`)
          .setColor('#ff0000')
          .setDescription('The queue is empty')
      );
      return true;
    }
  }
  return false;
}

function check_channel(message){
  const bot = message.guild.members.cache.get(client.user.id);
  if(distube.isPlaying(message) && bot.voice.channel !== message.member.voice.channel){
    message.channel.send(new MessageEmbed()
    .setTitle(`| ❌ERROR | You are not in the **same voice channel** as the bot.`)
    .setColor('#ff0000'));
    return true;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on("message", async (message) =>{
  if(!message.guild) return;
  if(message.author.bot) return;

  const {member, mentions} = message;

  const tag = `<@${member.id}>`;

  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift();
  if(message.content[0] === prefix){
    switch(command){
      case "ping": {
        message.reply(`${client.ws.ping}ms `); break;
      }


      case "play": {
        if(check_channel(message)){
          break;
        }
        if(!message.member.voice.channel){
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | You are not in the voice channel`)
          .setColor('#ff0000')
          );
          break; 
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | You must set something to play`)
          .setColor('#ff0000')
          );
          break;
        }
        if(args.join(" ").toLowerCase().includes("spotify") && args.join(" ").toLowerCase().includes("track")){
          getPreview(args.join(" ")).then(result=> {
            distube.play(message, result.title+" "+result.artist);
          }).catch(error => {
            message.channel.send('Something goes wrong X_X');
          });
        }
        else if(args.join(" ").toLowerCase().includes("spotify") && args.join(" ").toLowerCase().includes("playlist")){
          const getTracksList = await getTracks(args.join(" "));
          IsPlayingPlayList = getTracksList.length;
          let getDataSong = "";

          for (const song of getTracksList){
            getDataSong = await getPreview(song.external_urls.spotify);
            await sleep(1500);
            distube.play(message ,getDataSong.title+" "+getDataSong.artist);
          }
          message.channel.send(new MessageEmbed()
              .setTitle('✅ Playlist loaded')
              .setDescription(`Uploaded ${getTracksList.length} tracks`)
              .setColor('#ff0000')
            )
        }
        else {
          distube.play(message, args.join(" "));
        }
        break;
      }
      case "exit": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.stop(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Stopped music and left the voice channel')
              .setColor('#0377fc')
              )
        break;
      }
      case "stop": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.stop(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Stopped music and left the voice channel')
              .setColor('#0377fc')
        )
        break;
      }
      case "skip": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.skip(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Song skipped')
              .setColor('#0377fc')
        )
        break;
      }
      case "pause": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.pause(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Song paused')
              .setColor('#0377fc')
        )
        break;
      }
      case "resume": {
        if(distube.isPaused(message)){
          if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.resume(message);
        distube.pause(message);
        distube.resume(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Song resumed')
              .setColor('#0377fc')
        )
        break;
      }
      break;
      }
      case "autoplay": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        let mode = distube.toggleAutoplay(message);
        message.channel.send("Set autoplay mode to `" + (mode ? "On" : "Off") + "`");
        break;
      }
      case "volume": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | YOU MUST SET A VALUE FOR VOLUME`)
          .setColor('#ff0000')
          .setDescription(`Current Volume:${distube.getQueue(message).volume}\nThe volume can be equal to: 0-200`)
          );
          break;
        }
        let volumeSize=Number(args[0]);
        if(volumeSize>=0 && volumeSize<=200){
          distube.setVolume(message, Number(args[0]));
          message.channel.send("Set volume to `"+Number(args[0])+"`");
        }
        else{
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | YOU MUST SET A VALUE FOR VOLUME`)
          .setColor('#ff0000')
          .setDescription(`Current Volume:${distube.getQueue(message).volume}\nThe volume can be equal to: 0-200`)
          );
        }
        break;
      }
      case "shuffle": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.shuffle(message);
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Playlist shuffled')
              .setColor('#0377fc')
        )
        break;
      }

      case "repeat": {
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | YOU MUST SET A REPEAT MODE`)
          .setColor('#ff0000')
          .setDescription('REPEAT MODE CAN BE: off/0, song/1, queue/2 ')
          );
          break;
        }
        let repeatState;
        if(args[0].toString().toLowerCase() == "off") repeatState = 0;
        else if(args[0].toString().toLowerCase() == "0") repeatState = 0;
        else if(args[0].toString().toLowerCase() == "song") repeatState = 1;
        else if(args[0].toString().toLowerCase() == "1") repeatState = 1;
        else if(args[0].toString().toLowerCase() == "queue") repeatState = 2;
        else if(args[0].toString().toLowerCase() == "2") repeatState = 2;
        if(repeatState==0 || repeatState==1 || repeatState==2){
          distube.setRepeatMode(message, parseInt(repeatState));
          message.channel.send(new MessageEmbed()
          .setTitle(`Changed repeat mode to ${repeatState.toString().replace("0", "off").toString().replace("1", "song").toString().replace("2", "queue")}`)
          .setColor('#ff0000')
          );
        }
        else{
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | REPEAT MODE CAN BE: off/0, song/1, queue/2`)
          .setColor('#ff0000')
          );
        }
        break;
      }
      case "queue":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        let queue = distube.getQueue(message);
        message.channel.send(new MessageEmbed()
          .setTitle(`Current queue = ${queue.songs.length}`)
          .setDescription(queue.songs.map((song, id) => `${id + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
          ).slice(0, 10).join("\n"))
          .setColor('#ff0000')
          );
        
        break;
        
      }     

      case "details":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        let queue=distube.getQueue(message);
        let track = queue.songs[0];
        message.channel.send(new MessageEmbed()
            .setTitle(`Now Playing ${track.name}`)
            .setColor('#ff0000')
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .addField(`Views`, ` 👁‍🗨 ${track.views}`, true)
            .addField(`Likes `, `:thumbsup: ${track.likes}`, true)
            .addField(`Duration `, `🕝 ${track.formattedDuration}`, true)
            .addField(`Publish date`, `${track.info.videoDetails.publishDate}`, true)
            .addField(`Owner Channel`, `${track.info.videoDetails.ownerChannelName}`, true)
          );
        
        break;
      }

      case "search":{
        if(check_channel(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE FOR A SEARCH`)
            .setColor('#ff0000')
          );
          break;
        }
        let searchResult="";
        let result = distube.search(args.join(" ")).then(result=>{
          for(let i=0; i<5; i++){
            try{
              searchResult = searchResult+ `${i}) [${result[i].name}](${result[i].url}) - Duration: ${result[i].formattedDuration} \n`;
            }catch{
              searchResult = "\n";
            }
          }

          message.channel.send(new MessageEmbed()
          .setTitle(`Searching Results for: ${args.join(" ")}`)
          .setDescription(searchResult)
          .setColor('ff0000')
        ).then(message2=>{
          message2.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 60000, errors:["time"]}).then(collected =>{
            let userInput = collected.first().content;
            if(Number(userInput) <= 0 && Number(userInput)>10){
              message.reply("NOT A VALID NUMBER, PUTTING THE FIRST TRACK");
              userInput = 0;
            }
            distube.play(message, result[userInput-1].url);
          }).catch( e=>{
            message.channel.send("An error encountered: " + e);
          })
        })
        });
        break;
      }
      case "clean":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        distube.getQueue(message).songs.length=1;
        message.channel.send(new MessageEmbed()
          .setTitle(`⏭ Queue cleaned`)
          .setColor('ff0000')
        )
        break;
      }

      // PLAYLISTS FOR USERS
      case "addlist":{
        if(!args[0]){
          message.channel.send(new MessageEmbed()
          .setTitle(`❌ You must set something `)
          .setColor('ff0000')
        )
        break;
        }
        let user = message.member.id.toString();
        let music = args[0].toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        if(MusicList.hasOwnProperty(user)){
          if(music.toLowerCase().includes("youtube") && music.toLowerCase().includes("watch")){       // COPY ONE VIDEO FROM YOUTUBE BY LINK
            MusicList[user].music.push(music);
            MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
            fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
              message.reply("Music added to your playlist");
            });
            break;
          }

          else if(music.toLowerCase().includes("youtube") && music.toLowerCase().includes("playlist")){
            message.channel.send(new MessageEmbed()
            .setTitle(`❌ Error `)
            .setDescription(`To copy a playlist you need to use !play and after !addqueue`)
            .setColor('ff0000')
          )
          break;
          }

          else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("track")){       // COPY ONE VIDEO FROM SPOTIFY BY LINK
              getPreview(args.join(" ")).then(result=> {
                distube.search(result.title+" "+result.artist).then(result=>{   // COPY BY WORDS
                  MusicList[user].music.push(result[0].url);
                  MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
                  fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                    message.reply("Music added to your playlist");
                  });
              });
            });
            break;
          }
          

          else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("playlist")){
            message.channel.send(new MessageEmbed()
            .setTitle(`❌ Error `)
            .setDescription(`To copy a playlist you need to use !play and after !addqueue`)
            .setColor('ff0000')
          )
          break;
          }
          else{
            distube.search(args.join(" ")).then(result=>{   // COPY BY WORDS
              MusicList[user].music.push(result[0].url);
              MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
              fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                message.reply("Music added to your playlist");
              });
            });
            break;
          }
        }
        else{
          if(music.toLowerCase().includes("youtube") && music.toLowerCase().includes("watch")){
            MusicList[user] = {"music":[music]};
            MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
            fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
              message.reply("Music added to your playlist");
            });
            break;
          }
          else if(music.toLowerCase().includes("youtube") && music.toLowerCase().includes("playlist")){
            message.channel.send(new MessageEmbed()
            .setTitle(`❌ Error `)
            .setDescription(`To copy a playlist you need to use !play and after !addqueue`)
            .setColor('ff0000')
          )
          break;
          }
          else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("track")){       // COPY ONE VIDEO FROM SPOTIFY BY LINK
            getPreview(args.join(" ")).then(result=> {
              distube.search(result.title+" "+result.artist).then(result=>{   // COPY BY WORDS
                MusicList[user] = {"music":[result[0].url]};
                MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
                fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                  message.reply("Music added to your playlist");
                });
            });
          });
          break;
        }
        else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("playlist")){
          message.channel.send(new MessageEmbed()
          .setTitle(`❌ Error `)
          .setDescription(`To copy a playlist you need to use !play and after !addqueue`)
          .setColor('ff0000')
        )
        break;
        }
          else{
            distube.search(args.join(" ")).then(result=>{
              MusicList[user] = {"music":[result[0].url]};
              MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
              fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                message.reply("Music added to your playlist");
              });
            });
          }
        }
        break;
      }
      case "addqueue":{
        if(check_connection(message)){
          break;
        }

        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        let queue = distube.getQueue(message);
        let i=0

        if(queue.songs.length === 0) {
          message.reply(`The queue is empty`);
          break;
        }
          for(i=0;i<queue.songs.length;i++){
            if(MusicList.hasOwnProperty(user)){
              if(queue.songs[i].url.toLowerCase().includes("youtube") && queue.songs[i].url.toLowerCase().includes("watch")){
                MusicList[user].music.push(queue.songs[i].url);
              }
              else{
                console.log(`BAD LINK ON ${i+1}`);
              }
            }
            else{
              if(queue.songs[i].url.toLowerCase().includes("youtube") && queue.songs[i].url.toLowerCase().includes("watch")){
                MusicList[user] = {"music":[queue.songs[i].url]};
              }
              else{
                console.log(`BAD LINK ON ${i+1}`);
              }
            }
          }
          MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
          fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
            message.reply(`Added ${i} songs to playlist`);
          });
        break;
      }
      case "addcurrent":{
        if(check_connection(message)){
          break;
        }
        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        let queue = distube.getQueue(message);
        if(MusicList.hasOwnProperty(user)) MusicList[user].music.push(queue.songs[0].url);
        else {
          MusicList[user] = {"music":[queue.songs[0].url]};
        }
        MusicList[user].music = MusicList[user].music.length<=150 ? MusicList[user].music : MusicList[user].music.slice(Math.max(MusicList[user].music.length - 150, 0));
        fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
          message.channel.send(new MessageEmbed()
          .setTitle(`✅ Music added to your playlist `)
          .setColor('ff0000')
        )
        });

        break;
      }
      case "deletelist":{
        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        delete MusicList[user];
        fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
          message.reply("Playlist removed")
        });
        break;
      }
      
      case "deletebylist":{
        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        let musicSelect = Number(args[0]);
        MusicList = JSON.parse(MusicList);
        if(!MusicList.hasOwnProperty(user)){
          message.channel.send(new MessageEmbed()
            .setTitle(`❌ Sorry but you don't have own playlist `)
            .setColor('ff0000')
          )
        break;
        }
        if(musicSelect>=1 && musicSelect<=MusicList[user].music.length){
          MusicList[user].music.splice(musicSelect-1, 1);
          fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
            message.reply("Music removed");
          });
          break;
        }
        message.channel.send(new MessageEmbed()
            .setTitle(`❌ Invalid Value `)
            .setColor('ff0000')
          )

        break;
      }
      case "deletecurrent":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }

        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        if(!MusicList.hasOwnProperty(user)){
          message.channel.send(new MessageEmbed()
            .setTitle(`❌ Sorry but you don't have own playlist `)
            .setColor('ff0000')
          )
        break;
        }
        let i=0,k=0;
        let currentSong = distube.getQueue(message).songs[0].url.toString();
        while(i<MusicList[user].music.length && k==0){
          if(MusicList[user].music[i] == currentSong){
            k++;
          }
          i++;
        }
        if(k==0){
          message.channel.send(new MessageEmbed()
            .setTitle(`❌ Sorry but you don't have this music in your playlist `)
            .setColor('ff0000')
          );
          break;
        }
        
        MusicList[user].music.splice(i-1, 1);
        fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
          message.reply("Music removed");
        });

        break;
      }

      case "showlist":{
        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        if(MusicList.hasOwnProperty(user)){
          let AllMusic = "";
          (async () =>{

              for(let i=0;(i<MusicList[user].music.length && i<=10);i++){

                AllMusic = AllMusic + `${i}) ${MusicList[user].music[i]} \n`;
              }
                message.channel.send(new MessageEmbed()
                  .setTitle(`🆒 Your Playlist      ${MusicList[user].music.length}`)
                  .setColor('ff0000')
                  .setDescription(AllMusic)
                );
          })();

        }
        else{
          message.channel.send(new MessageEmbed()
          .setTitle(`❌ Sorry but you don't have own playlist `)
          .setColor('ff0000')
        );
        }
        break;
      }

      case "playlist":{
        if(!message.member.voice.channel){
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | You are not in the voice channel`)
          .setColor('#ff0000')
          );
          break; 
        }
        let user = message.member.id.toString();
        let MusicList = fs.readFileSync('./src/playlists.json','utf8');
        MusicList = JSON.parse(MusicList);
        if(!MusicList.hasOwnProperty(user)){
          message.channel.send(new MessageEmbed()
            .setTitle(`❌ Sorry but you don't have own playlist `)
            .setColor('ff0000')
          );
          break;
        }
        if(MusicList[user].music.length === 0){
          message.channel.send(new MessageEmbed()
            .setTitle(`❌ Sorry but your playlist is empty `)
            .setColor('ff0000')
          );
          break;
        }
        IsPlayingPlayList = MusicList[user].music.length;
        for (i of MusicList[user].music){
          await sleep(2000);
          distube.play(message,i);
        }
        message.channel.send(new MessageEmbed()
              .setTitle('✅ Playlist loaded')
              .setDescription(`Uploaded ${MusicList[user].music.length} tracks`)
              .setColor('#ff0000')
        );
        break;
      }
      case "help":{
        message.channel.send(new MessageEmbed()
            .setTitle(` List of musical commands `)
            .setColor('ff0000')
            .setDescription('`play`,`exit/stop`,`skip`,`details`,`autoplay`,`shuffle`,`repeat`,`lyrics <song title>`,\n`search`,`queue - to see queue`,`clean - to clean current queue`\n\n **To Control Audio Player**\n\n`volume`,`pause`,`resume`\n\n**To Control And Use Your Playlist**\n\n`playlist - will play your playlist`,\n`addlist - adds music to your playlist`,\n`addqueue - adds current queue to your playlist`\n`deletelist - deletes your playlist`,`deletebylist - delets from your playlist by number`\n`deletecurrent`,`addcurrent`,`showlist` \n\n **Mod** \n\n `ban`,`kick`,`clear` \n\n **Fun** \n\n `hug`, `slap, roll` \n\n **Additional** \n\n `donate`, `invitebot`')
          );
        break;
      }
      case "lyrics":{
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | You must set a value for lyrics`)
          .setColor('#ff0000')
          );
          break;
        }
        
      let musicTitle = args.join('');
      await fetch('https://some-random-api.ml/lyrics?title='+musicTitle)
          .then(res => res.json())
          .then(json => {
            fs.writeFile("./src/LyricsTxt.txt", json.lyrics, function err(){
              message.channel.send(`Lyrics for ${args.join(" ")}`, { files: ["./src/LyricsTxt.txt"] })
            });
      }).catch(error => {
        message.channel.send('Something goes wrong X_X');
      });
      break;
      }

      case "slap":{
        const url = `https://g.tenor.com/v1/search?q=slap&key=${process.env.TENORKEY}&limit=15`;
        let response = await fetch(url);
        let json = await response.json();
        let index = Math.floor(Math.random() * json.results.length);
        message.channel.send(`${tag} slapped ${!args[0] ? message.channel.members.random() : args[0]}`);
        message.channel.send(json.results[index].url);
        break;
      }

      case "hug":{
        const url = `https://g.tenor.com/v1/search?q=hug&key=${process.env.TENORKEY}&limit=15`;
        let response = await fetch(url);
        let json = await response.json();
        let index = Math.floor(Math.random() * json.results.length);
        message.channel.send(`${tag} hugged ${!args[0] ? message.channel.members.random() : args[0]}`);
        message.channel.send(json.results[index].url);
        break;
      }

      case "roll":{
        if(!args[0]) {
          message.channel.send(`Dropped ${Math.floor(Math.random() * (6))}`);
          break;
        }
        let maxRoll=Number(args[0]);
        if(maxRoll>=6 && maxRoll<=999){
          message.channel.send(`Dropped ${Math.floor(Math.random() * (maxRoll))}`);
        }
        else{
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | You must set a valid value for roll`)
          .setColor('#ff0000')
          .setDescription(`The value can be equal to: 6-999`)
          );
        }
        break;
      }

      // Admin Commands
      
      case "ban": {
        if(member.hasPermission('ADMINISTRATOR') || member.hasPermission('BAN_MEMBERS')){
          const target = mentions.users.first();
          if(!target){
            message.reply(`You didn't choose anyone`);
          }
          if (target.id === message.author.id) {
            message.reply(
              "You can not ban yourself!"
            );
            break;
          }
          if (target.id === message.guild.ownerID) {
            message.channel.send("You cannot Ban The Server Owner");
            break;
          }
          const targetMember = message.guild.members.cache.get(target.id);
          if(member.id === message.guild.ownerID){
            if(target){
              targetMember.ban();
              message.channel.send(`User has been banned`)
            }
            else{
              message.reply(`You didn't choose anyone`);
            }
            break;
          }
          else if (targetMember.hasPermission('ADMINISTRATOR')) {
            message.channel.send("You cannot ban the administrator");
            break;
          }
          if(target){
            targetMember.ban();
            message.channel.send(`User has been banned`)
          }
          else{
            message.reply(`You didn't choose anyone`);
          }
        }
        else{
          message.reply(`You do not have permission to use this command`);
        }
        break;
      }

      case "kick": {
        if(member.hasPermission('ADMINISTRATOR') || member.hasPermission('KICK_MEMBERS')){
          const target = mentions.users.first();
          if(!target){
            message.reply(`You didn't choose anyone`);
          }
          if (target.id === message.author.id) {
            message.reply(
              "You can not kick yourself!"
            );
            break;
          }
          if (target.id === message.guild.ownerID) {
            message.channel.send("You cannot kick The Server Owner");
            break;
          }
          const targetMember = message.guild.members.cache.get(target.id);
          if(member.id === message.guild.ownerID){
            if(target){
              targetMember.kick();
              message.channel.send(`User has been kicked`)
            }
            break;
          }
          else if (targetMember.hasPermission('ADMINISTRATOR')) {
            message.channel.send("You cannot kick the administrator");
            break;
          }
          if(target){
            targetMember.kick();
            message.channel.send(`User has been kicked`)
          }
        }
        else{
          message.reply(`You do not have permission to use this command`);
        }
        break;
      }

      case "clear": {
        if(member.hasPermission('ADMINISTRATOR') || member.hasPermission('MANAGE_MESSAGES')){
          if(!args[0]) {
            message.channel.bulkDelete(5).then(messages => console.log(`Bulk deleted ${messages.size} messages`))
          .catch(console.error);
            break;
          }
          let countMess=Number(args[0]);
          if(countMess>=1 && countMess<=50){
            message.channel.bulkDelete(countMess+1).then(messages => console.log(`Bulk deleted ${messages.size} messages`))
          .catch(console.error);
          }
          else{
            message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | You must set a valid value for clear`)
            .setColor('#ff0000')
            .setDescription(`The value can be equal to: 1-50`)
            );
          }
        }
        else {
          message.reply(`You do not have permission to use this command`);
        }
        
        break;
      }

      case "donate": {
        message.channel.send(new MessageEmbed()
          .setTitle(`If you want to support me`)
          .setColor('#FFA500')
          .setURL("https://www.donationalerts.com/r/nyaqu")
          );
        break;
      }

      case "invitebot": {
        message.channel.send(new MessageEmbed()
          .setTitle(`Link to invite me`)
          .setColor('#FFA500')
          .setDescription('https://discord.com/api/oauth2/authorize?client_id=899249004259459122&permissions=8&scope=bot')
          .setURL("https://discord.com/api/oauth2/authorize?client_id=899249004259459122&permissions=8&scope=bot")
          );
        break;
      }

      default: {
        message.channel.send(new MessageEmbed()
        .setTitle("❌ Unknown command")
        .setDescription("Unknown command, use !help to see available  commands")
        .setColor('#ff0000')
      )}
    }
  }
});


distube
    .on("playSong", (message, queue, song) => {
      message.channel.send(
        new MessageEmbed()
        .setTitle(`Now Playing`)
        .setColor('#ff0000')
        .setThumbnail(song.thumbnail)
        .setDescription(`[${song.name}](${song.url})\n\nDuration: ${song.formattedDuration} \n\nRequested by: ${song.user}`)
    )
})
    .on('addList', (message, queue, playlist, song) =>{
      message.channel.send(
        `Added \`${playlist.name}\` playlist (${
          playlist.songs.length
        } songs`,)
    })
    .on("error", (message, e,song, queue) => {
      console.error(e);
      console.log("An error encountered: " + e);
    })
    .on("addSong", (message, queue, song) =>{
      if(IsPlayingPlayList!=0){
        IsPlayingPlayList--;
      }
      if(IsPlayingPlayList==0){
          const exampleEmbed = new MessageEmbed()
          .setTitle(`Added`)
          .setColor('#ff0000')
          .setThumbnail(song.thumbnail)
          .setDescription(`[${song.name}](${song.url})\n\nDuration: ${song.formattedDuration} \n\nRequested by: ${song.user}`);
        message.channel.send(
          exampleEmbed
        )
      }
});
