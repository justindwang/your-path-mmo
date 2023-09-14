var DIRECTIONS_TO_OFFSETS = {
    up:           {x:  0, y: -1},
    up_right:     {x:  1, y: -1},
    right:        {x:  1, y:  0},
    down_right:   {x:  1, y:  1},
    down:         {x:  0, y:  1},
    down_left:    {x: -1, y:  1},
    left:         {x: -1, y:  0},
    up_left:      {x: -1, y: -1}
}
var _cache = {
    "black": [0,0,0],
    "navy": [0,0,128],
    "darkblue": [0,0,139],
    "mediumblue": [0,0,205],
    "blue": [0,0,255],
    "darkgreen": [0,100,0],
    "green": [0,128,0],
    "teal": [0,128,128],
    "darkcyan": [0,139,139],
    "deepskyblue": [0,191,255],
    "darkturquoise": [0,206,209],
    "mediumspringgreen": [0,250,154],
    "lime": [0,255,0],
    "springgreen": [0,255,127],
    "aqua": [0,255,255],
    "cyan": [0,255,255],
    "midnightblue": [25,25,112],
    "dodgerblue": [30,144,255],
    "forestgreen": [34,139,34],
    "seagreen": [46,139,87],
    "darkslategray": [47,79,79],
    "darkslategrey": [47,79,79],
    "limegreen": [50,205,50],
    "mediumseagreen": [60,179,113],
    "turquoise": [64,224,208],
    "royalblue": [65,105,225],
    "steelblue": [70,130,180],
    "darkslateblue": [72,61,139],
    "mediumturquoise": [72,209,204],
    "indigo": [75,0,130],
    "darkolivegreen": [85,107,47],
    "cadetblue": [95,158,160],
    "cornflowerblue": [100,149,237],
    "mediumaquamarine": [102,205,170],
    "dimgray": [105,105,105],
    "dimgrey": [105,105,105],
    "slateblue": [106,90,205],
    "olivedrab": [107,142,35],
    "slategray": [112,128,144],
    "slategrey": [112,128,144],
    "lightslategray": [119,136,153],
    "lightslategrey": [119,136,153],
    "mediumslateblue": [123,104,238],
    "lawngreen": [124,252,0],
    "chartreuse": [127,255,0],
    "aquamarine": [127,255,212],
    "maroon": [128,0,0],
    "purple": [128,0,128],
    "olive": [128,128,0],
    "gray": [128,128,128],
    "grey": [128,128,128],
    "skyblue": [135,206,235],
    "lightskyblue": [135,206,250],
    "blueviolet": [138,43,226],
    "darkred": [139,0,0],
    "darkmagenta": [139,0,139],
    "saddlebrown": [139,69,19],
    "darkseagreen": [143,188,143],
    "lightgreen": [144,238,144],
    "mediumpurple": [147,112,216],
    "darkviolet": [148,0,211],
    "palegreen": [152,251,152],
    "darkorchid": [153,50,204],
    "yellowgreen": [154,205,50],
    "sienna": [160,82,45],
    "brown": [165,42,42],
    "darkgray": [169,169,169],
    "darkgrey": [169,169,169],
    "lightblue": [173,216,230],
    "greenyellow": [173,255,47],
    "paleturquoise": [175,238,238],
    "lightsteelblue": [176,196,222],
    "powderblue": [176,224,230],
    "firebrick": [178,34,34],
    "darkgoldenrod": [184,134,11],
    "mediumorchid": [186,85,211],
    "rosybrown": [188,143,143],
    "darkkhaki": [189,183,107],
    "silver": [192,192,192],
    "mediumvioletred": [199,21,133],
    "indianred": [205,92,92],
    "peru": [205,133,63],
    "chocolate": [210,105,30],
    "tan": [210,180,140],
    "lightgray": [211,211,211],
    "lightgrey": [211,211,211],
    "palevioletred": [216,112,147],
    "thistle": [216,191,216],
    "orchid": [218,112,214],
    "goldenrod": [218,165,32],
    "crimson": [220,20,60],
    "gainsboro": [220,220,220],
    "plum": [221,160,221],
    "burlywood": [222,184,135],
    "lightcyan": [224,255,255],
    "lavender": [230,230,250],
    "darksalmon": [233,150,122],
    "violet": [238,130,238],
    "palegoldenrod": [238,232,170],
    "lightcoral": [240,128,128],
    "khaki": [240,230,140],
    "aliceblue": [240,248,255],
    "honeydew": [240,255,240],
    "azure": [240,255,255],
    "sandybrown": [244,164,96],
    "wheat": [245,222,179],
    "beige": [245,245,220],
    "whitesmoke": [245,245,245],
    "mintcream": [245,255,250],
    "ghostwhite": [248,248,255],
    "salmon": [250,128,114],
    "antiquewhite": [250,235,215],
    "linen": [250,240,230],
    "lightgoldenrodyellow": [250,250,210],
    "oldlace": [253,245,230],
    "red": [255,0,0],
    "fuchsia": [255,0,255],
    "magenta": [255,0,255],
    "deeppink": [255,20,147],
    "orangered": [255,69,0],
    "tomato": [255,99,71],
    "hotpink": [255,105,180],
    "coral": [255,127,80],
    "darkorange": [255,140,0],
    "lightsalmon": [255,160,122],
    "orange": [255,165,0],
    "lightpink": [255,182,193],
    "pink": [255,192,203],
    "gold": [255,215,0],
    "peachpuff": [255,218,185],
    "navajowhite": [255,222,173],
    "moccasin": [255,228,181],
    "bisque": [255,228,196],
    "mistyrose": [255,228,225],
    "blanchedalmond": [255,235,205],
    "papayawhip": [255,239,213],
    "lavenderblush": [255,240,245],
    "seashell": [255,245,238],
    "cornsilk": [255,248,220],
    "lemonchiffon": [255,250,205],
    "floralwhite": [255,250,240],
    "snow": [255,250,250],
    "yellow": [255,255,0],
    "lightyellow": [255,255,224],
    "ivory": [255,255,240],
    "white": [255,255,255]
}

var colorDictionary = {
    monochrome: {
      hueRange: null,
      lowerBounds: [[0,0],[100,0]],
      saturationRange: [ 0, 100 ],
      brightnessRange: [ 0, 0 ]
    },
    red: {
      hueRange: [ -26, 18 ],
      lowerBounds: [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]],
      saturationRange: [ 20, 100 ],
      brightnessRange: [ 50, 100 ]
    },
    orange: {
      hueRange: [ 18, 46 ],
      lowerBounds: [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]],
      saturationRange: [ 20, 100 ],
      brightnessRange: [ 70, 100 ]
    },
    yellow: {
      hueRange: [ 46, 62 ],
      lowerBounds: [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]],
      saturationRange: [ 25, 100 ],
      brightnessRange: [ 75, 100 ]
    },
    green: {
      hueRange: [ 62, 178 ],
      lowerBounds: [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]],
      saturationRange: [ 30, 100 ],
      brightnessRange: [ 40, 100 ]
    },
    blue: {
      hueRange: [ 178, 257 ],
      lowerBounds: [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]],
      saturationRange: [ 20, 100 ],
      brightnessRange: [ 35, 100 ]
    },
    purple: {
      hueRange: [ 257, 282 ],
      lowerBounds: [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]],
      saturationRange: [ 20, 100 ],
      brightnessRange: [ 42, 100 ]
    },
    pink: {
      hueRange: [ 282, 334 ],
      lowerBounds: [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]],
      saturationRange: [ 20, 100 ],
      brightnessRange: [ 73, 100 ]
    }
}
  
// random color library
function HSVtoRGB (hsv) {
    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1;}
    if (h === 360) {h = 359;}
  
    // Rebase the h,s,v values
    h = h/360;
    var s = hsv[1]/100,
        v = hsv[2]/100;
  
    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;
  
    switch(h_i) {
      case 0: r = v; g = t; b = p;  break;
      case 1: r = q; g = v; b = p;  break;
      case 2: r = p; g = v; b = t;  break;
      case 3: r = p; g = q; b = v;  break;
      case 4: r = t; g = p; b = v;  break;
      case 5: r = v; g = p; b = q;  break;
    }
  
    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    return result;
}
function HSVtoHex (hsv){
    var rgb = HSVtoRGB(hsv);
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }
    var hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
    return hex;
}
function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }
  
    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
}
function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {
  
      var number = parseInt(colorInput);
  
      if (number < 360 && number > 0) {
        return [number, number];
      }
  
    }
  
    if (typeof colorInput === 'string') {
  
      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange;}
      } else if (colorInput.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
        var hue = HexToHSB(colorInput)[0];
        return [ hue, hue ];
      }
    }
  
    return [0,360];
  
}
function randomWithin (range) {
    //generate random evenly destinct number from : https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
    var golden_ratio = 0.618033988749895
    var r=Math.random()
    r += golden_ratio
    r %= 1
    return Math.floor(range[0] + r*(range[1] + 1 - range[0]));
}
function getMinimumBrightness(H, S) {
    var lowerBounds = getColorInfo(H).lowerBounds;
  
    for (var i = 0; i < lowerBounds.length - 1; i++) {
  
      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];
  
      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];
  
      if (S >= s1 && S <= s2) {
  
         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;
  
         return m*S + b;
      }
  
    }
  
    return 0;
}
function pickHue(hue) {
    var hueRange = getHueRange(hue);

    var h = randomWithin(hueRange);

    if (h < 0) 
        h = 360 + h;
    return h;
}

function pickSaturation (hue, H) {

    if (H === 'monochrome') 
      return 0;
    
    var saturationRange = getSaturationRange(hue);
  
    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    return randomWithin([sMin, sMax]);
}

function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
}
  
function pickBrightness (H, S, hue) {
    var bMin = getMinimumBrightness(H, S),
        bMax = 100;
  
    return randomWithin([bMin, bMax]);
}

function rankComparator(a, b) {
    const rankOrder = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const rankValueA = rankOrder.indexOf(a['rank']);
    const rankValueB = rankOrder.indexOf(b['rank']);
    if(rankValueA > rankValueB)
        return 1;
    return -1;
}

module.exports = Object.freeze({
    COLORS: {
        blue: '#2c97de',
        blue_alt: '#227fbb',
        yellow: '#f2c500',
        yellow_alt: '#f59d00',
        orange: '#e87e04',
        orange_alt: '#d55400',
        red: '#e94b35',
        red_alt: '#c23824',
        green: '#428700',
        green_alt: '#1aaf5d',
        purple: '#9c56b8',
        purple_alt: '#8f3faf',
        teal: '#00bd9c',
        teal_alt: '#00a185',
        slate: '#33495f',
        slate_alt: '#2b3e51',
        gray: '#95a5a6',
        gray_alt: '#7f8c8d',

        light_blue: '#add8e6',
        light_green: '#90ee90',
        dark_green: '#013220',
        brown: '#281c11',
        light_brown: '#513922',
        carnation_pink: '#ffa6c9',
        peach: '#f6b26b',
        forest_green: '#014421',
        oak_brown: '#806517',
        dark_gray: '#5A5A5A',
        golden_oak: '#bb8141',
        dirty_water: '#d0eee1',
        cave_floor: '#ab946f',
        cave_wall: '#1e202a',
        salt_floor: '#f5f5f5',
        salt_wall: '#46769b',

        mp_blue: '#4932b9',
        exp_green: '#77dd77',
        hp_red: '#9a2828',
        stat_yellow: '#FDFD96',

        S_brown: '#a52a2a',
        A_orchid: '#da70d6',
        B_aero: '#85B9E1ff',
        C_cadetblue: '#5f9ea0',
        D_pastelgreen: '#77dd77',
        E_goldenrod: '#daa520',
        F_peachpuff: "#ffdab9",
    },
    merge: function(destination) {
        var sources = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for(var key in source){
                destination[key] = source[key];
            }
        }
        return destination;
    },
    getOffsetCoordsFromDirection: function(direction) {
        return {
            x: DIRECTIONS_TO_OFFSETS[direction].x,
            y: DIRECTIONS_TO_OFFSETS[direction].y
        };
    },
    getTileDistance: function(x1, y1, x2, y2){
        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        return Math.max(dx, dy);
    },
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    //adds commas and truncates to 5 characters
    truncateToFiveCharacters: function(number) {
        if (Math.abs(number) >= 1e9) {
            return (number / 1e9).toFixed(1) + "B";
        } else if (Math.abs(number) >= 1e6) {
            return (number / 1e6).toFixed(1) + "M";
        } else if (Math.abs(number) >= 1e3) {
            return (number / 1e3).toFixed(1) + "K";
        } else {
            return number.toString();
        }
    },
    truncateToFourCharacters: function(number) {
        if (Math.abs(number) >= 1e9) {
            return (number / 1e9).toFixed(0) + "B";
        } else if (Math.abs(number) >= 1e6) {
            return (number / 1e6).toFixed(0) + "M";
        } else if (Math.abs(number) >= 1e3) {
            return (number / 1e3).toFixed(0) + "K";
        } else {
            return number.toString();
        }
    },
    mapLengthToFlexTd(length){
        if(length > 10)
          return '5px';
        if(length > 6)
          return '20px';
        return '40px';
    },
    mapJobToSize(str){
        const maxLength = 15;
        let firstLine = str.substring(0, maxLength);
        let secondLine = str.substring(maxLength);

        // Check if the first line ends with a space
        if (!firstLine.endsWith(' ')) {
            const lastSpaceIndex = firstLine.lastIndexOf(' ');

            // If there is a space, split at the last space
            if (lastSpaceIndex !== -1) {
                firstLine = firstLine.substring(0, lastSpaceIndex);
                secondLine = str.substring(lastSpaceIndex + 1);
                if (secondLine.length > 15){
                    firstLine = str.substring(0, str.length / 2);
                    secondLine = str.substring(str.length / 2);
                    if(firstLine.length < secondLine.length)
                        firstLine += '-';
                    else
                        secondLine = '-' + secondLine;
                }
            } else {
                // If there are no spaces, split with a hyphen if necessary
                if (secondLine.charAt(0) !== '-') {
                    if(firstLine.length < secondLine.length)
                        firstLine += '-';
                    else
                        secondLine = '-' + secondLine;
                }
            }
        }
        return {
            text: firstLine.trim() + ' ' + secondLine.trim(),
            width: Math.max(firstLine.length, secondLine.length) * 6,
            maxLength: Math.max(firstLine.length, secondLine.length),
        };
    },
    prettyprint: function(arr){
        let arrText = '';
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                arrText+=arr[i][j]+' ';
            }
            console.log(arrText);
            arrText='';
        }
    },
    prettyprint2: function(arr){
        let arrText = '';
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                if(arr[i][j])
                    arrText+=arr[i][j][0]+' ';
            }
            console.log(arrText);
            arrText='';
        }
    },
    apply2D(array, fn) {
        for (let i = 0; i < array.length; i++) {
          for (let j = 0; j < array[i].length; j++) {
            array[i][j] = fn(array[i][j]);
          }
        }
    },
    // Takes item-probability pairs and returns a random item based on the probability distribution
    getRandomFromRate(dict) {
        const keys = Object.keys(dict);
      
        // Next, we'll create an array of the probabilities corresponding to each key
        const probabilities = keys.map(key => dict[key]);
      
        // Then, we'll create a new array of the cumulative probabilities, which will be used to determine which key to return
        const cumulativeProbabilities = [];
        let cumulativeProbability = 0;
        for (const probability of probabilities) {
          cumulativeProbability += probability;
          cumulativeProbabilities.push(cumulativeProbability);
        }
      
        // Now we'll generate a random number between 0 and 1
        const randomNumber = Math.random();
      
        // Finally, we'll iterate through the cumulative probabilities array and return the key corresponding to the first cumulative probability that is greater than the random number
        for (let i = 0; i < cumulativeProbabilities.length; i++) {
          if (randomNumber < cumulativeProbabilities[i]) {
            return keys[i];
          }
        }
    },
    mapAbbrToStat: function(abbr){
        switch(abbr){
            case 'Str': return 'strength';
            case 'Agi': return 'agility';
            case 'Int': return 'intelligence';
            case 'Vit': return 'vitality';
            case 'Luck': return 'luck';
            default: return 'error';
        }
    },
    mapRankToColor: function(rank){
        switch(rank){
            case 'S': return '#a52a2a';
            case 'A': return '#da70d6';
            case 'B': return '#85B9E1ff';
            case 'C': return '#5f9ea0';
            case 'D': return '#77dd77';
            case 'E': return '#daa520';
            case 'F': return "#ffdab9";
            case 'Unique': return '#50577A';
            default: return "#ffdab9";
        }
    },
    mapGroupToIcon: function(group){
        switch(group) {
            case 'healing': return '<img src="assets/heal.png"/>';
            case 'mp_recovery': return '<img src="assets/heal.png"/>';
            case 'weapon': return '<img src="assets/weapon.png"/>';
            case 'material': return '<img src="assets/drops.png"/>';
            case 'special': return '<img src="assets/special.png"/>';
            case 'combat': return '<img src="assets/weapon.png"/>';
            case 'misc': return '<img src="assets/stats.png"/>';
        }
    },
    rankToColorHtml(rank){
        switch(rank){
            case 'S': return '<span style="color:brown">';
            case 'A': return '<span style="color:orchid">';
            case 'B': return '<span style="color:#85B9E1ff">';
            case 'C': return '<span style="color:cadetblue">';
            case 'D': return '<span style="color: #77DD77">';
            case 'E': return '<span style="color:goldenrod">';
            case 'F': return '<span style="color:peachpuff">';
            default: return '<span style="color:peachpuff">';
        }
    },
    sortArrayOfObjects(arr, key) {
        if(key == 'rank'){
            return arr.sort((a, b) => (rankComparator(a, b)));
        }
        return arr.sort((a, b) => (a[key] > b[key] ? 1 : -1));
    },
    sortedArrayOfObjectsCopy(arr, key) {
        var temp = [...arr];
        if(key == 'rank')
            temp.sort((a, b) => (rankComparator(a, b)));
        else
            temp.sort((a, b) => (a[key] > b[key] ? 1 : -1));
        return temp;
    },
    selectRandomElement: function(array) {
        // Generate a random index between 0 and the length of the array
        const randomIndex = Math.floor(Math.random() * array.length);
        // Return the element at the random index
        return array[randomIndex];
    },
    compareArraysOfObjects(arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return false;
        }
      
        for (let i = 0; i < arr1.length; i++) {
            const keys1 = Object.keys(arr1[i]);
            const keys2 = Object.keys(arr2[i]);
            
            if (keys1.length !== keys2.length) {
                return false;
            }
            
            for (let key of keys1) {
                if (arr1[i][key] !== arr2[i][key]) {
                    return false;
                }
            }
        }
        return true;
    }, 
    compareObjects(obj1, obj2) {
        if(!obj1 || !obj2)
            return;
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
          return false;
        }
        for (let i = 0; i < keys1.length; i++) {
          const key = keys1[i];
          if (obj1[key] !== obj2[key]) {
            return false;
          }
        }
      
        return true;
    },
    arrFind(arr, key, toFind){
        for(var i = 0; i< arr.length; i++){
          if (arr[i][key]== toFind)
              return arr[i];
        }
        return false;
    },
    add_(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] += arguments[j][i];
			}
		}
		return color1;
	},
    add(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] += arguments[j][i];
			}
		}
		return result;
	},
	subtract: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] -= arguments[j][i];
			}
		}
		return result;
	},
    _clamp(num) {
		if (num < 0) {
			return 0;
		} else if (num > 255) {
			return 255;
		} else {
			return num;
		}
	},
    toRGB(color) {
        var _clamp = function(num) {
            if (num < 0) {
                return 0;
            } else if (num > 255) {
                return 255;
            } else {
                return num;
            }
        };
		return "rgb(" + _clamp(color[0]) + "," + _clamp(color[1]) + "," + _clamp(color[2]) + ")";
	},
    interpolate(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
		}
		return result;
	},
    fromString(str) {
		var cached, r;
		if (str in _cache) {
			cached = _cache[str];
		} else {
			if (str.charAt(0) == "#") { /* hex rgb */

				var values = str.match(/[0-9a-f]/gi).map(function(x) { return parseInt(x, 16); });
				if (values.length == 3) {
					cached = values.map(function(x) { return x*17; });
				} else {
					for (var i=0;i<3;i++) {
						values[i+1] += 16*values[i];
						values.splice(i, 1);
					}
					cached = values;
				}

			} else if (r = str.match(/rgb\(([0-9, ]+)\)/i)) { /* decimal rgb */
				cached = r[1].split(/\s*,\s*/).map(function(x) { return parseInt(x); });
			} else { /* html name */
				cached = [0, 0, 0];
			}

			_cache[str] = cached;
		}

		return cached.slice();
	},
    randomColor :function(hue) {
        var H,S,B;
        H = pickHue(hue);
        S = pickSaturation(H, hue);
        B = pickBrightness(H, S, hue);
      
        // Then we return the HSB color in the desired format
        return HSVtoHex([H,S,B]);
    },
    serializeArray(arr) {
        var res = [];
        for(var i = 0; i<arr.length; i++){
          res.push(arr[i].serializeForMenuUpdate());
        }
        return res;
    },
    exportArr(arr){
        var res = []
        for(var s = 0; s < arr.length; s++){
          res.push(arr[s].type);
        }
        return JSON.stringify(res);
    },
    findNthTile(playerX, playerY, clickedX, clickedY, n) {
        const deltaX = Math.abs(clickedX - playerX);
        const deltaY = Math.abs(clickedY - playerY);
        const signX = playerX < clickedX ? 1 : -1;
        const signY = playerY < clickedY ? 1 : -1;
        let error = deltaX - deltaY;
      
        let x = playerX;
        let y = playerY;
        let tilesVisited = 0;
      
        while (x !== clickedX || y !== clickedY) {
            if (tilesVisited == n) 
              return {x: x, y: y};
            tilesVisited++;
            const doubleError = 2 * error;
            // Determine the next step
            if (doubleError > -deltaY) {
              error -= deltaY;
              x += signX;
            }
            if (doubleError < deltaX) {
              error += deltaX;
              y += signY;
            }
        }
        return { x: clickedX, y: clickedY }; // Return the clicked tile if the nth tile is not found
    },
  });