let SpotifyWebApi = require('spotify-web-api-node');
const insp= require("util").inspect;
let ins = (x) => insp(x, {depth:null});

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

function getAlbumTracks(albumName, artistName) {
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
  ).then(
      function(data) {
        let albums = data.body.albums.items;
        if (albums.length >= 1) {
          let id = albums[0].id;
          return spotifyApi.getAlbumTracks(id);
        } else {
          return [];
        }
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  ).then(
      function(data) {
        if (data.length === 0) {
          return [];
        }

        let tracksArray = [];
        let tracks = data.body.items;
        //console.log(data.body.items);
        let promises = [];

        tracks.forEach(function(track) {
          promises.push(spotifyApi.getTrack(track.id).then(
              function(data) {
                tracksArray.push(data.body);
              },
              function(err) {
                console.error("error retrieving data ", err);
              }
          ));
        });

        return Promise.all(promises).then(
          function(data) {
            return tracksArray;
          }
        )
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  )
}

function getArtistAlbums(artistName) {
  return authenticate().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        return spotifyApi.searchArtists(artistName);
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  ).then(
      function(data) {
        let artists = data.body.artists.items;
        if (artists.length >= 1) {
          return spotifyApi.getArtistAlbums(artists[0].id);
        } else {
          return [];
        }
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  ).then(
      function(data) {
        return data;
      },
      function(err) {
        console.error("error retrieving data ", err);
      }
  )
}

module.exports = {getAlbumInfo, getAlbumTracks, getArtistAlbums}