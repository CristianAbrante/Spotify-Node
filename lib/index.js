
let Table = require('table').table;
let SpotifyGetter = require('./spotify-getters');
let Sync = require('deasync');
let opn = require('opn');
let lyric = require('lyric-get');

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

/**
 * Auxiliary method used to retrieve
 * data in a synchronous way from
 * a promise.
 *
 * @param promise Spotify promise.
 * @returns {*} the data retrieved.
 */
function retrieveDataSyncFrom(promise) {
  let data;
  synchronizePromise(function* () {
    data = yield promise;
  });
  while(data === undefined) {
    Sync.sleep(SLEEP_TIME);
  }
  return data;
}

/**
 * Function used to give a good formatting
 * for the duration of the songs.
 *
 * @param millis milliseconds of the duration
 *               of the song.
 *
 * @returns {string} that represents the time
 */
function convertTime(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/**
 * Auxiliary function used to log a table
 * with the given data.
 *
 * @param data
 */
function logTableData(data) {
  let table = [Object.getOwnPropertyNames(data)];

  for (let i = 0; i < data.name.length; i += 1) {
    let elem = [];
    for (let field in data) {
      elem.push(data[field][i]);
    }
    table.push(elem);
  }

  let output = Table(table);
  console.log(output);
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

  let data = retrieveDataSyncFrom(SpotifyGetter.getAlbumInfo(albumName, artistName));

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
 * Function that logs the album info
 * in a table.
 *
 * @param albumName name of the album we want.
 * @param artistName name of the artist of the album.
 */
function logAlbumInfo(albumName, artistName) {
  let data = getAlbumInfo(albumName, artistName);
  logTableData(data);
}

/**
 * Method that returns the tracks of an
 * album.
 *
 * @param albumName name of the album
 * @param artistName name of the artist of the album
 *
 * @returns {{track_number: Array, name: Array, artists: Array, duration: Array, popularity: Array}}
 *          an array of the track number, an array with the names, an array with the duration,
 *          an array with the popularity.
 */
function getAlbumTracks(albumName, artistName) {
  if (albumName === undefined || artistName === undefined) {
    throw new SyntaxError('you must specify album and artist name.');
  }

  let data = retrieveDataSyncFrom(
      SpotifyGetter.getAlbumTracks(albumName, artistName));

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
    simplifiedData.duration.push(convertTime(track.duration_ms));
    simplifiedData.popularity.push(track.popularity + '%');
  });

  return simplifiedData;
}

/**
 * Method that logs the album tracks in
 * a table.
 *
 * @param albumName name of the album.
 * @param artistName name of the artist.
 */
function logAlbumTracks(albumName, artistName) {
  let data = getAlbumTracks(albumName, artistName);
  logTableData(data);
}

/**
 * Method that gets all the albums of the specified
 * artist.
 *
 * @param artistName name of the artist that we are searching.
 * @returns {{name: Array, type: Array, artists: Array, release_date: Array}}
 */
function getArtistAlbums(artistName) {
  if (artistName === undefined) {
    throw new SyntaxError('you must specify an artist name.');
  }
  let albums = retrieveDataSyncFrom(
      SpotifyGetter.getArtistAlbums(artistName));

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
 * Method that logs the artists albums in
 * a table.
 *
 * @param artistName
 */
function logArtistAlbums(artistName) {
  let data = getArtistAlbums(artistName);
  logTableData(data);
}

/**
 * Returns the artist top ten tracks ordered
 * by popularity in spain.
 *
 * @param artistName the artist we are searching
 * @returns {{name: Array, album: Array, artists: Array, duration: Array, popularity: Array}}
 */
function getArtistTopTracks(artistName) {
  let tracks = retrieveDataSyncFrom(
      SpotifyGetter.getArtistTopTracks(artistName));

  let simplifiedData = {name:[],
                        album:[],
                        artists:[],
                        duration:[],
                        popularity:[]};

  tracks.forEach(function(track) {
    simplifiedData.name.push(track.name);
    simplifiedData.album.push(track.album.name);
    let artists = [];
    track.artists.forEach(function(artist) {
      artists.push(artist.name);
    });
    simplifiedData.artists.push(artists);
    simplifiedData.duration.push(convertTime(track.duration_ms));
    simplifiedData.popularity.push(track.popularity + '%');
  });

  return simplifiedData;
}

/**
 * Logs the artist top ten tracks in
 * a table.
 *
 * @param artistName
 */
function logArtistTopTracks(artistName) {
  let data = getArtistTopTracks(artistName);
  logTableData(data);
}

/**
 * This method opens a browser with the specified
 * song
 *
 * @param trackName
 * @param artistName
 * @param albumName
 */
function playTrackPreview(trackName, artistName, albumName) {
  if (trackName === undefined) {
    throw new SyntaxError('track name should not be undefined');
  }

  let url = retrieveDataSyncFrom(
      SpotifyGetter.getTrackPreviewURL(trackName, artistName, albumName));
  if (url !== "") {
    opn(url);
  } else {
    console.log("can't reproduce current song.");
  }
}

/**
 * This method retrieve the lyrics of the current
 * song.
 *
 * @param trackName
 * @param artistName
 * @returns {*}
 */
function getLyrics(trackName, artistName) {
  if (trackName === undefined) {
    throw new SyntaxError('track name cant be undefined');
  }
  if (artistName === undefined) {
    throw new SyntaxError('artist name cant be undefined');
  }

  let lyrics;

  lyric.get(artistName, trackName, function(err, res){
    if(err){
      lyrics = 'lyric not found';
    }
    else{
      lyrics = res;
    }
  });

  while(lyrics === undefined) {
    Sync.sleep(SLEEP_TIME);
  }

  return lyrics;
}

module.exports = {getAlbumInfo,
                  logAlbumInfo,
                  getAlbumTracks,
                  logAlbumTracks,
                  getArtistAlbums,
                  logArtistAlbums,
                  getArtistTopTracks,
                  logArtistTopTracks,
                  playTrackPreview,
                  getLyrics};