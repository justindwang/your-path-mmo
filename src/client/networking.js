// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { processGameUpdate } from './state';
import { manageLogin, stopGame } from './index';
import { log } from './input';
const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.AUTHENTICATED, manageLogin);
    socket.on(Constants.MSG_TYPES.LOG_MESSAGE, log);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      stopGame();
    });
  })
);

export const newPlayer = player => {
  socket.emit(Constants.MSG_TYPES.NEW_PLAYER, player);
};

export const keyInput = key => {
  socket.emit(Constants.MSG_TYPES.INPUT, key);
};

export const mouseMapInput = coords => {
  socket.emit(Constants.MSG_TYPES.MOUSE_MAP_INPUT, coords);
};

export const menuInput = input => {
  socket.emit(Constants.MSG_TYPES.MENU_INPUT, input);
};

export const authenticate = code => {
  socket.emit(Constants.MSG_TYPES.AUTHENTICATE, code);
};

export const skillInput = coords => {
  socket.emit(Constants.MSG_TYPES.SKILL_INPUT, coords);
}
