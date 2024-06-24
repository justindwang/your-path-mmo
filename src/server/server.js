const { request } = require('undici');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');
// const https = require('https');
// const fs = require('fs');

const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

// if (process.env.NODE_ENV === 'development') {
//   // Setup Webpack for development
//   const compiler = webpack(webpackConfig);
//   app.use(webpackDevMiddleware(compiler));
// } else {
//   // Static serve the dist/ folder in production
//   app.use(express.static('dist'));
// }

// development mode on pm2
const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler));

// listen on 3000
if (process.env.NODE_ENV === 'local') {
  const server = app.listen(3000);
  console.log('Server listening on port 3000');
  var io = socketio(server);
} else {
  // Listen on http
  // const httpPort = process.env.HTTP_PORT || 80;
  // const server = app.listen(httpPort);
  // console.log(`Server listening on port ${httpPort}`);

  // Listen on https
  const httpPort = process.env.HTTPS_PORT || 80;
  // const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourpathmmo.com/privkey.pem', 'utf8');
  // const certificate = fs.readFileSync('/etc/letsencrypt/live/yourpathmmo.com/fullchain.pem', 'utf8');
  // const credentials = { key: privateKey, cert: certificate };

  // const httpsServer = https.createServer(credentials, app);
  const server = app.listen(httpPort);
  console.log(`Server listening on port ${httpPort}`);
  var io = socketio(server);
}

// Setup socket.io
// const io = socketio(httpsServer);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.AUTHENTICATE, authenticate);
  socket.on(Constants.MSG_TYPES.NEW_PLAYER, newPlayer);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.SKILL_INPUT, handleSkillInput);
  socket.on(Constants.MSG_TYPES.MOUSE_MAP_INPUT, handleMouseMapInput);
  socket.on(Constants.MSG_TYPES.MENU_INPUT, handleMenuInput);
  socket.on('disconnect', onDisconnect);

  // maybe to fix disconnected sockets
  socket.on('clientError', (error) => {
    console.error('Socket client error:', error);
    socket.destroy();
  });
  
});

function createTable() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./playerdata.db');

    const query = `CREATE TABLE IF NOT EXISTS players (
      discordId TEXT PRIMARY KEY,
      name TEXT,
      sprite TEXT,
      level INTEGER,
      job TEXT,
      outfit TEXT,
      title TEXT,
      gold INTEGER,
      hp INTEGER,
      hpMax INTEGER,
      mp INTEGER,
      mpMax INTEGER,
      strength INTEGER,
      vitality INTEGER,
      agility INTEGER,
      intelligence INTEGER,
      luck INTEGER,
      weapon TEXT,
      inventory TEXT,
      outfits TEXT,
      jobs TEXT,
      stats TEXT,
      exp INTEGER,
      expForNext INTEGER,
      skillSlots INTEGER,
      skills TEXT,
      fusedSkill TEXT
    )`;  
    db.run(query, [], function(err) {
      db.close();

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// returns player object with discordId from database
function fetchPlayer(discordId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./playerdata.db');

    // Prepare the SQL query to fetch player data
    const sql = 'SELECT * FROM players WHERE discordId = ?';

    // Execute the query with the discordId parameter
    db.get(sql, [discordId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// const player = {
//   discordId: '12345',
//   name: 'john',
//   sprite: 'casual_hoodie.png',
//   level: 1,
//   job: 'ninja',
//   title: 'none',
//   gold: 0,
//   hp: 10,
//   hpMax: 10,
//   mp: 10,
//   mpMax: 10,
//   strength: 2,
//   vitality: 1,
//   agility: 1,
//   intelligence: 1,
//   luck: 1,
//   weapon: 'yoo',
//   inventory: 'bruhh',
//   outfits: 'nice',
//   jobs: 'opp',
//   stats: 'gimme',
// };

createTable()
  .then(() => {
    console.log('Created table');
  })
  // .then(() => {
  //   return fetchPlayer('12346');
  // })
  // .then((data) => {
  //   console.log('Fetched player data:', data);
  // })
  .catch((error) => {
    console.error('Error inserting or fetching player data:', error);
  });


// Setup the Game
const game = new Game();
setInterval(function(){
  game.game_update();
}, 1000 / Constants.TICK_RATE);

async function authenticate(code){
  try {
    console.log('authenticating..');
    const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: '1125383741884342312',
        client_secret: '928btvVzYIuQ3aE0JRXeedXU4GwDfKeB',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `https://www.yourpathmmo.com`,
        scope: 'identify',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const oauthData = await tokenResponseData.body.json();
    const userResult = await request('https://discord.com/api/users/@me', {
	    headers: {
		    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
	    },
    });
    data = await userResult.body.json();
    fetchPlayer(data.id)
      .then((playerData) => {
        if(playerData){
          this.emit(Constants.MSG_TYPES.AUTHENTICATED, {message: 'returningPlayer', discordId: data.id});
          game.connectPlayer(this, playerData);
        }
        else{
          this.emit(Constants.MSG_TYPES.AUTHENTICATED, {message: 'newPlayer', discordId: data.id});
        }
    });
  } catch (error) {
    // NOTE: An unauthorized token will not throw an error
    // tokenResponseData.statusCode will be 401
    console.error(error);
  }
}

function newPlayer(player) {
  game.addPlayer(this, player.name, player.job, player.discordId);
}

function handleInput(action) {
  game.handleInput(this, action);
}

function handleSkillInput(coords) {
  game.handleSkillInput(this, coords);
}

function handleMouseMapInput(coords) {
  game.handleMouseMapInput(this, coords);
}

function handleMenuInput(input) {
  console.log(input);
  game.handleMenuInput(this, input);
}

function onDisconnect() {
  game.checkForCharacterUpdateOrRemoval(this);
}


// https://discord.com/api/oauth2/authorize?client_id=1125383741884342312&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&scope=identify