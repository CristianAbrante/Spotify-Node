
const insp= require("util").inspect;
let ins = (x) => insp(x, {depth:null});

let Spotify = require('../lib/index.js');

//let data = Spotify.logAlbumInfo('divide');
//console.log(data);
//Spotify.logAlbumInfo('el polvorete');


//Spotify.logArtistAlbums('Edjkadfs');

//Spotify.logAlbumInfo('love');

// Spotify.logArtistTopTracks('david bustamante')

//console.log(data);

//Spotify.playTrackPreview('the man who can\'t be moved', 'the Script');

Spotify.logAlbumTracks('science & faith', 'the script');

//let lyrics = Spotify.getLyrics("Invisible", 'Malú');
//console.log(lyrics);
//console.log('should be logged after info');



//Spotify.getAlbumTracks('÷ (Deluxe)', 'ed sheeran');