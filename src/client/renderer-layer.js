// const shortid = require('shortid');
// const ObjectClass = require('./object');
const Constants = require('../shared/constants');
import { COLORS, merge } from '../shared/util';
import { getCurrentState } from './state';

export default class RendererLayer {
  constructor(type, settings) {
    this.mergeWithPrevLayer = false;
    this.draw = false;
    this.cancelTileDrawWhenNotFound = false;

    this.type = type;
    var typeData = layerTypes[type];
    merge(this, typeData);
    for(var key in settings){
      if(this[key] !== void 0){
          this[key] = settings[key];
      }
    }
  }

  getTileData(x, y, prevTileData){
    return false;
  }

  getModifiedTileData(x, y, prevTileData){
    var tileData = this.getTileData(x, y, prevTileData);
    if(this.mergeWithPrevLayer && prevTileData){
        return this.mergeTileData(prevTileData, tileData);
    }
    return tileData;
  }

  mergeTileData(tileData1, tileData2){
    var result = {},
        key, val;
    for(key in tileData1){
        result[key] = tileData1[key];
    }
    for(key in tileData2){
        val = tileData2[key];
        if(val !== false && val !== void 0){
            result[key] = val;
        }
    }
    return result;
  }
}

let layerTypes = {
  map: {
      merge: true,
      cancelTileDrawWhenNotFound: true,
      // draw: true,
      getTileData: function(x, y){
        let state = getCurrentState();
        if(!state.map){
          return;
        }
        var tileData = state.map[x][y];
        if(!tileData)
          return;
        // if(!tile || !tile.explored){
        //     return false;
        // }
        // var tileData = tile.getTileDrawData(); Replaced by state.map[x][y]
        // var targets = this.game.player.actionTargets;
        // if(targets && targets.targets.length){

        //     var borderColor = 'rgba(0, 200, 0, 0.5)',
        //         borderColorSelected = 'rgba(0, 200, 0, 0.85)';

        //     var current = targets.getCurrent(false);
        //     var isCurrent = current && current.x === x && current.y === y;

        //     if(isCurrent){
        //         if(!targets.ignoreCurrent){
        //             tileData.borderColor = borderColorSelected;
        //             tileData.borderWidth = 2;
        //         } else {
        //             tileData.borderColor = borderColor;
        //             tileData.borderWidth = 1;
        //         }

        //     } else {
        //         var targetsAtTile = targets.map.get(x, y);
        //         if(targetsAtTile.length){
        //             tileData.borderColor = borderColor;
        //             tileData.borderWidth = 1;
        //         }
        //     }
        // }
        return tileData;
      }
  },
  sprite: {
      mergeWithPrevLayer: true,
      getTileData: function(x, y, prevTileData){
          let state = getCurrentState();
          if(!state.sprites){
            return;
          }
          var tileData = state.sprites[x][y];
          if(!tileData)
            return;
          // if(entity){
          //     var tileData = entity.getTileDrawData();
              // var smash = game.smashLayer.get(x, y);
              //   if(smash){
              //       var offsetX,
              //           offsetY,
              //           smashChar = '✹',
              //           smashColor = 'rgba(255, 255, 255, 0.75)';
              //       if(smash.type === 'attack'){

              //           var vx = (smash.targetX - smash.sourceX);
              //           var vy = (smash.targetY - smash.sourceY);
              //           var dis = Math.sqrt(vx * vx + vy * vy);
              //           vx /= dis;
              //           vy /= dis;

              //           var targetX = Math.round(vx + smash.sourceX);
              //           var targetY = Math.round(vy + smash.sourceY);

              //           offsetX = (targetX - smash.sourceX) * 0.5;
              //           offsetY = (targetY - smash.sourceY) * 0.5;

              //           smashColor = 'rgba(255, 255, 0, 0.75)';
              //       }

              //       tileData.before = {
              //           mask: true,
              //           // x: smash.sourceX,
              //           // y: smash.sourceY,
              //           char: smashChar,
              //           color: smashColor,
              //           // color: 'rgba(255, 165, 0, 0)',
              //           // fontSize: 30,
              //           charStrokeWidth: 0.5,
              //           // charStrokeColor: 'rgba(255,255,255,0.9)',
              //           // color: 'rgba(255,255,255,0.5)',
              //           offsetX: offsetX * this.game.renderer.tileSize,
              //           offsetY: offsetY * this.game.renderer.tileSize
              //       };
              //   }
              // return tileData;
          // }
          return {
            sprite: tileData.sprite,
            stunned: tileData.stunned,
          };
      }
  },
  smash: {
    getTileData: function(x, y){
        let state = getCurrentState();
        if(!state.smash){
          return;
        }
        var tileData = state.smash[x][y];
        if(!tileData)
          return;
        tileData.char = '✹';
        tileData.charStrokeWidth = 0.5;
        tileData.sprite = null;
        return tileData;
      }
  },
  damage: {
    getTileData: function(x, y){
        let state = getCurrentState();
        if(!state.damage){
          return;
        }
        var tileData = state.damage[x][y];
        if(!tileData)
          return;
        tileData.charStrokeWidth = 2;
        tileData.fontSize = 50;
        return tileData;
      }
  },
  info: {
    getTileData: function(x, y, prevTileData){
      let state = getCurrentState();
      if(!state.sprites){
        return;
      }
      var tileData = state.sprites[x][y];
      if(!tileData)
        return;
      return {
        name: tileData.name,
        hp: tileData.hp,
        hpMax: tileData.hpMax,
        offset: tileData.offset,
      };
    }
  }
//   lighting: {
//       // this layer does mutate the prevTileData but not in the same way as merging
//       mergeWithPrevLayer: false,
//       draw: true,
//       getTileData: function(x, y, prevTileData){
//           const {player, game} = getCurrentState();
//           if(!game){
//               return false;
//           }
//           if(game.lighting){
//               prevTileData = game.lighting.shadeTile(x, y, prevTileData);
//           }
//           return prevTileData;
//       }
//   },
//   furniture: {
//     mergeWithPrevLayer: true,
//     getTileData: function(x, y, prevTileData){
//         const {player, game} = getCurrentState();
//         if(!game){
//             return false;
//         }
//         var furniture = game.furnitureManager.get(x, y);
//         if(furniture.length){
//             var f = furniture[furniture.length - 1];
//             var tileData = f.getTileDrawData();
//             return tileData;
//         }
//         return false;
//     }
// },
};