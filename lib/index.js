let SpotifyWebApi = require('spotify-web-api-node');

const insp= require("util").inspect;
let ins = (x) => insp(x, {depth:null});

let Table = require('table').table;

const clientId = '8506bdee13264ff5b27c98415a5bf313',
    clientSecret = 'a2e3960dc8fa4028816195cced05663b';

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

/**
 * Returns the promise for authentication.
 * @param nextPromise
 * @returns {Promise}
 */
function authenticate(nextPromise) {
  return spotifyApi.clientCredentialsGrant();
}

/**
 * Function used to log the data in a
 * pretier way.
 * @param tableData
 */
function logTable(tableData) {
  let output = Table(tableData);
  console.log(output);
}

function logAlbumInfo(data) {
  let dataTable = [[' Album Name', 'Type', 'Artist', 'Release date']];

  let items = data.body.albums.items;
  items.forEach(function(album) {
    let item = [album.name, album.type]
    let result = '';
    album.artists.forEach(function(artist) {
      result += artist.name + ' ';
    })
    item.push(result);
    item.push(album.release_date);
    dataTable.push(item);
  })
  logTable(dataTable);
}

function getAlbumInfo(albumName, artist) {
  let query = "";
  if (albumName !== undefined ) {
    query += `album:${albumName} `;
  }
  if (artist !== undefined) {
    query += `artist:${artist}`;
  }
  if (query === "") {
    throw new TypeError("arguments can't be undefined");
  }

  authenticate().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        return spotifyApi.searchAlbums(query);
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  ).then(
      function(data) {
        logAlbumInfo(data);
      },
      function(err) {
        console.error("error fetching data ", err);
      }
  );
}

function getAlbumTracks(albumName, artist) {
  let query = "";
  if (albumName !== undefined ) {
    query += `album:${albumName} `;
  }
  if (artist !== undefined) {
    query += `artist:${artist}`;
  }
  if (query === "") {
    throw new TypeError("arguments can't be undefined");
  }

  authenticate().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        return spotifyApi.searchTracks(query);
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  ).then(
      function(data) {
        console.log(ins(data.body));
      },
      function(err) {
        console.error("error fetching data ", err);
      }
  );
}

module.exports = {getAlbumInfo, getAlbumTracks};