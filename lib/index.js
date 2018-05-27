const insp= require("util").inspect;
let ins = (x) => insp(x, {depth:null});

let Table = require('table').table;
let SpotifyGetter = require('./spotify-getters');
let Sync = require('deasync');

const SLEEP_TIME = 100;

/**
 * Auxiliar method used to
 * synchronize the spotify promise.
 *
 * @param fn
 */
let synchronizePromise = fn => {
  let iterator = fn();
  let loop = result => {
    !result.done && result.value.then(res =>
        loop(iterator.next(res)));
  };
  loop(iterator.next());
};

function covertTime(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/**
 * This sync function returns an object with the specified
 * album information.
 *
 * @param albumName name of the album we want to search
 * @param artistName (optional) name of the artist of the album
 *
 * @returns {{name: Array, type: Array, artists: Array, release_date: Array}}
 *          object with 4 properties, first is an array of names of albums,
 *          types of this albums (single, album, recopilation...)
 *          and finally the release date of the album.
 */
function getAlbumInfo(albumName, artistName) {
  if (albumName === undefined) {
    throw new SyntaxError('you must specify artist name.');
  }

  let data;
  synchronizePromise(function* () {
    data = yield SpotifyGetter.getAlbumInfo(albumName, artistName);
  });
  while(data === undefined) {
    Sync.sleep(SLEEP_TIME);
  }

  // Albums is an array of simplified album objects.
  let albums = data.body.albums.items;

  let simplifiedData = {name:[],
                        type:[],
                        artists:[],
                        release_date:[]};

  albums.forEach(function(album) {
    simplifiedData.name.push(album.name);
    simplifiedData.type.push(album.album_type);
    let artists = [];
    album.artists.forEach(function(artist) {
      artists.push(artist.name);
    });
    simplifiedData.artists.push(artists);
    simplifiedData.release_date.push(album.release_date);
  });

  return simplifiedData;
}

/**
 *
 * @param albumName
 * @param artistName
 */
function logAlbumInfo(albumName, artistName) {
  let data = getAlbumInfo(albumName, artistName);
  // Header of the table.
  let table = [Object.getOwnPropertyNames(data)];

  for (let i = 0; i < data.name.length; i += 1) {
    let album = [];
    for (let field in data) {
      album.push(data[field][i]);
    }
    table.push(album);
  }

  let output = Table(table);
  console.log(output);
}

function getAlbumTracks(albumName, artistName) {
  if (albumName === undefined || artistName === undefined) {
    throw new SyntaxError('you must specify album and artist name.');
  }

  let data;
  synchronizePromise(function* () {
    data = yield SpotifyGetter.getAlbumTracks(albumName, artistName);
  });
  while(data === undefined) {
    Sync.sleep(SLEEP_TIME);
  }

  let simplifiedData = {track_number:[],
                        name:[],
                        artists:[],
                        duration:[],
                        popularity:[]};
  data.forEach(function(track) {
    simplifiedData.track_number.push(track.track_number);
    simplifiedData.name.push(track.name);
    let artists = [];
    track.artists.forEach(function(artist) {
      artists.push(artist.name);
    });
    simplifiedData.artists.push(artists);
    simplifiedData.duration.push(covertTime(track.duration_ms));
    simplifiedData.popularity.push(track.popularity + '%');
  })

  return simplifiedData;
}

function logAlbumTracks(albumName, artistName) {
  let data = getAlbumTracks(albumName, artistName);
  // Header of the table.
  let table = [Object.getOwnPropertyNames(data)];

  for (let i = 0; i < data.name.length; i += 1) {
    let album = [];
    for (let field in data) {
      album.push(data[field][i]);
    }
    table.push(album);
  }

  let output = Table(table);
  console.log(output);

}

module.exports = {getAlbumInfo, logAlbumInfo, getAlbumTracks, logAlbumTracks};