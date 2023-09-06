
function wrapStr(str, color){
    var style = '';
    if(typeof color === 'string'){
        style = ' style="color:' + color + '"';
    }
    return '<span' + style + '>' + str + '</span>';
}

export function wrap(obj){
    return wrapStr(obj.name, obj.color);
}
