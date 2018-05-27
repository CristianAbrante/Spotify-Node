let SpotifyWebApi = require('spotify-web-api-node');

const clientId = '8506bdee13264ff5b27c98415a5bf313',
    clientSecret = 'a2e3960dc8fa4028816195cced05663b';

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

function authenticate() {
  return spotifyApi.clientCredentialsGrant();
}

function getAlbumInfo(albumName, artistName) {
  let query = "";
  if (albumName !== undefined ) {
    query += `album:${albumName} `;
  }
  if (artistName !== undefined) {
    query += `artist:${artistName}`;
  }
  if (query === "") {
    throw new TypeError("arguments can't be undefined");
  }

  return authenticate().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        return spotifyApi.searchAlbums(query);
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  )
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

module.exports = {getAlbumInfo}