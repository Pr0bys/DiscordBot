const lyricsFinder = require('lyrics-finder');
(async function(artist, title) {
    let lyrics = await lyricsFinder(artist, title) || "Not Found!";
    console.log(lyrics);
})("poets of fall", "carnival of rust");