
const Discord = require('discord.js');
// https://github.com/fent/node-ytdl-core/commit/d1f535712410eebd79a7468abd07d94f8c4ebe5a
const { MessageEmbed } = require('discord.js');
require("dotenv").config();

const fs = require('fs');

const fetch = require('node-fetch');

const client = new Discord.Client({
  restTimeOffset: 0, //changes reaction speed to 0 aka fastest
  presence:{
    status:"dnd",
    activity:{
      name: "Music",
      type:"PLAYING"
    },
  }
});

const Distube = new require("distube");

const { getPreview, getTracks } = require("spotify-url-info")

//const { SpotifyPlugin } = require("@distube/spotify");

const distube = new Distube(client);

let IsPlayingPlayList = 0;

client.on("ready", () => {
  console.log(`${client.user.tag } is now online and ready to use`);  
  //console.log(client.voice.channel.id);
});

client.login(process.env.BOT_TOKEN);
const prefix="!";
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
client.on("message", async (message) =>{
  if(!message.guild) return;
  if(message.author.bot) return;
  const args = message.content.slice(prefix.length).split(" ");
  console.log("ARGS:"+args);
  const command = args.shift();
  // console.log(command);
  // console.log(message.channel.id);
  if(message.content[0] === prefix){
    switch(command){
      case "ping": {
        message.reply(`${client.ws.ping}ms `); break;
      }

      // For test
      case "q": {
        // Client->user
        // console.log(message.member.id+" |IdUser| ");
        // console.log(message.member.voice.channel.id+" |IMP| ");
        //console.log(message.member.voice.channel);
        // distube.search("Childhood dream").then(result => console.log(result));
        message.channel.send("SHOVEL");
        console.log(distube.options);
        break;
      }

      case "p": {
        message.channel.send(new MessageEmbed()
              .setTitle('Playing standard music ')
              .setColor('#ff0000')
        );
        distube.play(message, "Childhood dreams Seraphine");
        break;
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
            //console.log(result.title+" "+result.artist);
            distube.play(message, result.title+" "+result.artist);
          });
        }
        else if(args.join(" ").toLowerCase().includes("spotify") && args.join(" ").toLowerCase().includes("playlist")){
          let number_list;
            getTracks(args.join(" ")).then(result=> {
              //console.log(result);
              IsPlayingPlayList = result.length;
              for (const song of result){
                getPreview(song.external_urls.spotify).then(result1=>{
                  distube.play(message, result1.title+" "+result1.artist);
                  console.log(result1.title+" "+result1.artist);
                });
              }
              message.channel.send(new MessageEmbed()
              .setTitle('Playlist loaded ')
              .setColor('#ff0000')
              .setDescription('Uploaded '+result.length+'tracks')
              )
            });
        }
        else {
          console.log(args.join(" "));
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
              .setTitle('✅ Song resume')
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
        console.log("repeatState = "+ repeatState);
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
      // Time video direct time
      case "seek":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE FOR A SEEK`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
          break;
        }
        if(parseInt(args[0])<0){
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET A POSITIVE VALUE`)
            .setColor('#ff0000')
          );
          break;
        }
        let seekTime = Number(args[0]);
        // console.log("DURANTION CURRENT: "+ distube.getQueue(message).songs[0].duration);
        // console.log("SEEK: " + seekTime);
        if(seekTime < distube.getQueue(message).songs[0].duration && seekTime >= 0){
          distube.seek(message, seekTime*1000);
        }
        else{
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE LESS THEN MUISC DURATION FOR A SEEK`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
        }
        break;
      }
      // Time video peremotka
      case "forward":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE FOR A FORWARD`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
          break;
        }
        if(parseInt(args[0])<0){
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET A POSITIVE VALUE`)
            .setColor('#ff0000')
          );
          break;
        }
        let queue=distube.getQueue(message);
        let forwardTime = parseInt(queue.currentTime/1000+Number(args[0]));
        // console.log("SONG CURRENT: "+queue.currentTime);
        // console.log("forward:"+ forwardTime);
        if(forwardTime < distube.getQueue(message).songs[0].duration && forwardTime >= 0){
          distube.seek(message, forwardTime*1000);
        }
        else{
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE LESS THEN MUISC DURATION FOR A FORWARD`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
        }
        break;
      }
      // Time video peremotka naoborot
      case "rewind":{
        if(check_channel(message)){
          break;
        }
        if(check_connection(message)){
          break;
        }
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE FOR A REWIND`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
          break;
        }
        if(parseInt(args[0])<0){
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET A POSITIVE VALUE`)
            .setColor('#ff0000')
          );
          break;
        }
        let queue=distube.getQueue(message);
        let rewindTime = parseInt(queue.currentTime/1000-Number(args[0]));
        if(rewindTime < distube.getQueue(message).songs[0].duration){
          distube.seek(message, rewindTime*1000);
        }
        else if(rewindTime){
          if(rewindTime < distube.getQueue(message).songs[0].duration){
            distube.seek(message, 0);
          }
        }
        else{
          message.channel.send(new MessageEmbed()
            .setTitle(`| ❌ERROR | YOU MUST SET VALUE FOR A REWIND`)
            .setColor('#ff0000')
            .setDescription(`Music duration: ${distube.getQueue(message).songs[0].duration} sec`)
          );
        }
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
        //console.log(track);
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
              searchResult = searchResult+ `${i+1}) [${result[i].name}](${result[i].url}) - Duration: ${result[i].formattedDuration} \n`;
              //console.log("+");
            }catch{
              searchResult = "\n";
              //console.log("-");
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
        let queue = distube.getQueue(message);
        console.log(queue.songs.length);
        distube.getQueue(message).songs.length=1;
        // distube.jump(message, queue.songs.length);
        // distube.skip(message);
        message.channel.send(new MessageEmbed()
          .setTitle(`⏭ Queue cleaned`)
          .setColor('ff0000')
        )
        break;
      }

      // Aici
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
            fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
              message.reply("Music added to Playlist");
            });
          }
          else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("track")){       // COPY ONE VIDEO FROM SPOTIFY BY LINK
              getPreview(args.join(" ")).then(result=> {
                distube.search(result.title+" "+result.artist).then(result=>{   // COPY BY WORDS
                  MusicList[user].music.push(result[0].url);
                  fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                    console.log("Data Saved");
                  });
              });
            });
          }
          else{
            distube.search(args.join(" ")).then(result=>{   // COPY BY WORDS
              MusicList[user].music.push(result[0].url);
              fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                console.log("Data Saved");
              });
            });
          }
        }
        else{
          if(music.toLowerCase().includes("youtube") && music.toLowerCase().includes("watch")){
            MusicList[user] = {"music":[music]};
            fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
              message.reply("Music added to Playlist");
            });
          }
          else if(music.toLowerCase().includes("spotify") && music.toLowerCase().includes("track")){       // COPY ONE VIDEO FROM SPOTIFY BY LINK
            getPreview(args.join(" ")).then(result=> {
              distube.search(result.title+" "+result.artist).then(result=>{   // COPY BY WORDS
                MusicList[user] = {"music":[result[0].url]};
                fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                  console.log("Data Saved");
                });
            });
          });
        }
          else{
            distube.search(args.join(" ")).then(result=>{
              MusicList[user] = {"music":[result[0].url]};
              fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
                message.reply("Music added to Playlist");
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
        console.log("ADDQUEUE - 1");
        let i=0
          for(i=0;i<queue.songs.length;i++){
            if(MusicList.hasOwnProperty(user)){
              if(queue.songs[i].url.toLowerCase().includes("youtube") && queue.songs[i].url.toLowerCase().includes("watch")){
                console.log("PUSH");
                MusicList[user].music.push(queue.songs[i].url);
              }
              else{
                console.log(`BAD LINK ON ${i+1}`);
              }
            }
            else{
              if(queue.songs[i].url.toLowerCase().includes("youtube") && queue.songs[i].url.toLowerCase().includes("watch")){
                console.log("PUSH");
                MusicList[user] = {"music":[queue.songs[i].url]};
              }
              else{
                console.log(`BAD LINK ON ${i+1}`);
              }
            }
          }
          console.log("QUEUE ADDED");
          fs.writeFile("./src/playlists.json", JSON.stringify(MusicList), function err(){
            message.reply(`Added ${i+1} songs`);
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
          console.log("Element deleted");
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
        console.log("Music Select: "+musicSelect);
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
            console.log("SHOVEL!");
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
              let result;
              for(let i=0;(i<MusicList[user].music.length && i<=10);i++){
                result = await distube.search(MusicList[user].music[i])
                AllMusic = AllMusic + `${i+1}) ${result[0].name} - ${result[0].url} \n`;
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
        IsPlayingPlayList = MusicList[user].music.length;
        for await (i of MusicList[user].music){
          distube.play(message,i);
        }
        // for await (let i=0;i<MusicList[user].music.length;i++){
        //   distube.play(message,MusicList[user].music[i]);
        // }
        break;
      }
      case "help":{
        message.channel.send(new MessageEmbed()
            .setTitle(`Command List `)
            .setColor('ff0000')
            .setDescription('`play`,`exit/stop`,`skip`,`details`,`autoplay`,`shuffle`,`repeat`,`lyrics <song title>`,\n`search`,`queue - to see queue`,`clean - to clean current queue`\n\n **To Control Aduio Player**\n\n`seek`,`forward`,`rewind`,`volume`,`pause`,`resume`\n\n**To Control And Use Your Playlist**\n\n`playlist - will play your playlist`,\n`addlist - adds to your playlist`,\n`addqueue - adds current queue to your playlist`\n`deletelist - deletes your playlist`,`deletebylist - delets from your playlist by number`\n`deletecurrent`,`addcurrent`,`showlist`')
          );
        break;
      }
      case "lyrics":{
        if(!args[0]) {
          message.channel.send(new MessageEmbed()
          .setTitle(`| ❌ERROR | YOU MUST SET A VALUE FOR LYRICS`)
          .setColor('#ff0000')
          );
          break;
        }
      let MusicLyric = args.join('');
      fetch('https://some-random-api.ml/lyrics?title='+MusicLyric)
          .then(res => res.json())
          .then(json => {
            fs.writeFile("./src/LyricsTxt.txt", json.lyrics, function err(){
              message.channel.send("Testing message.", { files: ["./src/LyricsTxt.txt"] })
            });
      });
      break;
      }
      case "nickname":{
        //client.user.member.setNickname("Altron");
        let target = message.mentions.users.first();
        let member = message.guild.members.cache.get(target.id);
        args.shift();
        let nickName = args.join(' ');
        member.setNickname(nickName);
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
      //user = user.content.slice("@");
      //message.channel.send(`${queue.songs.id}`);

      const exampleEmbed = new MessageEmbed()
        .setTitle(`Now Playing`)
        .setColor('#ff0000')
        .setThumbnail(song.thumbnail)
        .setDescription(`[${song.name}](${song.url})\n\nDuration: ${song.formattedDuration} \n\nRequested by: ${song.user}`);
      message.channel.send(
        exampleEmbed
        //`>>> Playing   |-- ${song.name} --| \nDuration|-- ${song.formattedDuration} --|`
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
      //distube.play(message, song.name);
      message.channel.send("An error encountered: " + e);
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
          //`>>> Playing   |-- ${song.name} --| \nDuration|-- ${song.formattedDuration} --|`
        )
      }
      //message.channel.send(`>>> Added ${song.name} \nto the queue by ${song.user}`)
});
