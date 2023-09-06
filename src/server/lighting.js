const { add_, fromString } = require('../shared/util');

class Lighting{
    constructor(reflectivityCallback, options) {
        this._reflectivityCallback = reflectivityCallback;
        this._options = {
            passes: 1,
            emissionThreshold: 100,
            range: 10
        };
        
        this._fov = null;
        this._lights = {};
        this._reflectivityCache = {};
        this._fovCache = {};
    
        this.setOptions(options);
    }
    setOptions(options) {
        for (var p in options) { this._options[p] = options[p]; }
        if (options.range) { this.reset(); }
        return this;
    }
    setFOV(fov) {
        this._fov = fov;
        this._fovCache = {};
        return this;
    }
    setLight(x, y, color) {
        var key = x+","+y;
    
        if (color) {
            this._lights[key] = (typeof(color) == "string" ? fromString(color) : color);
        } else {
            delete this._lights[key];
        }
        return this;
    }
    reset() {
        this._reflectivityCache = {};
        this._fovCache = {};
        return this;
    }
    compute(lightingCallback) {
        var doneCells = {};
        var emittingCells = {};
        var litCells = {};
    
        for (var key in this._lights) { /* prepare emitters for first pass */
            var light = this._lights[key];
            if (!(key in emittingCells)) { emittingCells[key] = [0, 0, 0]; }
    
            add_(emittingCells[key], light);
        }
    
        for (var i=0;i<this._options.passes;i++) { /* main loop */
            this._emitLight(emittingCells, litCells, doneCells);
            if (i+1 == this._options.passes) { continue; } /* not for the last pass */
            emittingCells = this._computeEmitters(litCells, doneCells);
        }
    
        for (var litKey in litCells) { /* let the user know what and how is lit */
            var parts = litKey.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            lightingCallback(x, y, litCells[litKey]);
        }
    
        return this;
    }
    _emitLight(emittingCells, litCells, doneCells) {
        for (var key in emittingCells) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this._emitLightFromCell(x, y, emittingCells[key], litCells);
            doneCells[key] = 1;
        }
        return this;
    }
    _computeEmitters(litCells, doneCells) {
        var result = {};
    
        for (var key in litCells) {
            if (key in doneCells) { continue; } /* already emitted */
    
            var color = litCells[key];
    
            if (key in this._reflectivityCache) {
                var reflectivity = this._reflectivityCache[key];
            } else {
                var parts = key.split(",");
                var x = parseInt(parts[0]);
                var y = parseInt(parts[1]);
                var reflectivity = this._reflectivityCallback(x, y);
                this._reflectivityCache[key] = reflectivity;
            }
    
            if (reflectivity == 0) { continue; } /* will not reflect at all */
    
            /* compute emission color */
            var emission = [];
            var intensity = 0;
            for (var i=0;i<3;i++) {
                var part = Math.round(color[i]*reflectivity);
                emission[i] = part;
                intensity += part;
            }
            if (intensity > this._options.emissionThreshold) { result[key] = emission; }
        }
    
        return result;
    }
    _emitLightFromCell(x, y, color, litCells) {
        var key = x+","+y;
        if (key in this._fovCache) {
            var fov = this._fovCache[key];
        } else {
            var fov = this._updateFOV(x, y);
        }
    
        for (var fovKey in fov) {
            var formFactor = fov[fovKey];
    
            if (fovKey in litCells) { /* already lit */
                var result = litCells[fovKey];
            } else { /* newly lit */
                var result = [0, 0, 0];
                litCells[fovKey] = result;
            }
    
            for (var i=0;i<3;i++) { result[i] += Math.round(color[i]*formFactor); } /* add light color */
        }
    
        return this;
    }
    _updateFOV(x, y) {
        var key1 = x+","+y;
        var cache = {};
        this._fovCache[key1] = cache;
        var range = this._options.range;
        var cb = function(x, y, r, vis) {
            var key2 = x+","+y;
            var formFactor = vis * (1-r/range);
            if (formFactor == 0) { return; }
            cache[key2] = formFactor;
        };
        this._fov.compute(x, y, range, cb.bind(this));
    
        return cache;
    }

}
module.exports = Lighting;