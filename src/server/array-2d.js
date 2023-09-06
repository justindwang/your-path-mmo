class Array2d {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = [];
        this.reset();
    }
    reset() {
        this.data = [];
        for (var i = 0; i < this.width; i++) {
            this.data[i] = [];
        }
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        for (var i = 0; i < this.width; i++) {
            if(this.data[i] === void 0){
                this.data[i] = [];
            }
        }
    }
    set(x, y, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        this.data[x][y] = value;
    }
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        return this.data[x][y];
    }
    remove(x, y) {
        this.set(x, y, void 0);
    }
    getAdjacent(x, y, settings) {
        settings = settings || {};
        var filter          = settings.filter           !== void 0 ? settings.filter        : false,
            withCoords      = settings.withCoords       !== void 0 ? settings.withCoords    : false,
            withDiagonals   = settings.withDiagonals    !== void 0 ? settings.withDiagonals : true;

        var _this = this,
            out = [],
            ax, ay;

        var add = function(x, y) {
            var val = _this.get(x, y);
            if (filter === false || (filter(val, x, y))) {
                if (withCoords) {
                    out.push({
                        x: x,
                        y: y,
                        value: val
                    });
                } else {
                    out.push(val);
                }
            }
        };

        // top
        ax = x;
        ay = y - 1;
        add(ax, ay);

        // bottom
        ax = x;
        ay = y + 1;
        add(ax, ay);

        // left
        ax = x - 1;
        ay = y;
        add(ax, ay);

        // right
        ax = x + 1;
        ay = y;
        add(ax, ay);

        if(withDiagonals){
            // top left
            ax = x - 1;
            ay = y - 1;
            add(ax, ay);

            // top right
            ax = x + 1;
            ay = y - 1;
            add(ax, ay);

            // bottom left
            ax = x - 1;
            ay = y + 1;
            add(ax, ay);

            // bottom right
            ax = x + 1;
            ay = y + 1;
            add(ax, ay);
        }

        return out.flat();
    }
    getWithinSquareRadius(x, y, settings) {
        settings = settings || {};

        var radius          = settings.radius           || 1,
            filter          = settings.filter           || false,
            withCoords      = settings.withCoords       || false,
            includeTarget   = settings.includeTarget    || false;

        var tileX = x,
            tileY = y;
        var minX = tileX - radius,
            maxX = tileX + radius,
            minY = tileY - radius,
            maxY = tileY + radius,
            output = [],
            val;

        if (minX < 0) {
            minX = 0;
        }
        if (minY < 0) {
            minY = 0;
        }
        if (maxX > this.width - 1) {
            maxX = this.width - 1;
        }
        if (maxY > this.height - 1) {
            maxY = this.height - 1;
        }
        var count = 0;
        for (x = minX; x <= maxX; x++) {
            for (y = minY; y <= maxY; y++) {
                count++;
                if (!includeTarget && tileX === x && tileY === y) {
                    continue;
                }
                val = this.data[x][y];

                if (filter === false || filter(val, x, y)) {
                    if (withCoords) {
                        output.push({
                            x: x,
                            y: y,
                            value: val
                        });
                    } else {
                        output.push(val);
                    }
                }
            }
        }
        return output;
    }
    filter(filter, withCoords){
        withCoords = withCoords || false;
        var output = [];
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var val = this.get(x, y);
                if(filter(val, x, y)){
                    if (withCoords) {
                        output.push({
                            x: x,
                            y: y,
                            value: val
                        });
                    } else {
                        output.push(val);
                    }
                }
            }
        }
        return output;
    }
    copy(){
        var newArray = new Array2d(this.width, this.height);
        for(var x = this.width - 1; x >= 0; x--){
            for(var y = this.height - 1; y >= 0; y--){
                var val = this.get(x, y);
                if(val !== void 0){
                    newArray.set(x, y, val);
                }
            }
        }
        return newArray;
    }
    each(func, context){
        for(var x = this.width - 1; x >= 0; x--){
            for(var y = this.height - 1; y >= 0; y--){
                var val = this.get(x, y);
                if(context){
                    func.call(context, val, x, y);
                } else {
                    func(val, x, y);
                }
            }
        }
    }

}
module.exports = Array2d;