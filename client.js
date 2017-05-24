var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var canvas = document.getElementById("canvas-id");
canvas.width = 700;
canvas.height = 700;
var context = canvas.getContext("2d");
var pixelSize = canvas.width/128; // Real size of each pixel
var token = ""; // User token
var rects; // All loaded color pixels
var color = []; // Color to rect match;
function create2dArray(length) {
    var array2d = [];
    for (var i = 0; i < length; i++) {
        array2d[i] = [];
        for (var j = 0; j < length; j++) {
            array2d[i][j] = 0;
        }
    }
    return array2d;
}
function checkToken()
{
    var request = new XMLHttpRequest();
    request.open("POST","checkToken/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            var resp = JSON.parse(request.responseText);
            console.log(resp);
            if(!resp.valid) token = resp.ntk;
            getElement(-1, function(res) {rects = [{x: 0, y :0, w: 128, h: 128, c: '#'+res}]; color[res] = [0]}); // Get first rectangle
        }
    }
}
function getElement(x, callback)
{
    var request = new XMLHttpRequest();
    request.open("POST","getElement/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("which="+encodeURIComponent(x)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            res = request.responseText;
            if(x >= 0) res = JSON.parse(request.responseText);
            if(callback != undefined) callback(res);
            return res;
        }
    }
}   
function divideRect(x)
{
    getElement(x, function(res)
    {
        if(res == undefined || rects[x] == undefined) return;
        var sx = rects[x].x;
        var sy = rects[x].y;
        var sw = rects[x].w;
        var sh = rects[x].h;
        color[rects[x].c.slice(1,7)] = undefined;
        if(res.tl == undefined) return;
        rects[4*x+1] = {x: sx, y: sy, w: sw/2, h: sh/2, c: '#'+res.tl.substring(0,6), al: res.tl.substring(6,8)};
        rects[4*x+2] = {x: sx+sw/2, y: sy, w: sw/2, h: sh/2, c: '#'+res.tr.substring(0,6), al: res.tr.substring(6,8)};
        rects[4*x+3] = {x: sx, y: sy+sh/2, w: sw/2, h: sh/2, c: '#'+res.bl.substring(0,6), al: res.tr.substring(6,8)};
        rects[4*x+4] = {x: sx+sw/2, y: sy+sh/2, w: sw/2, h: sh/2, c: '#'+res.br.substring(0,6), al: res.tr.substring(6,8)};
        if(color[res.tl.substring(0,6)] == undefined) color[res.tl.substring(0,6)] = [4*x+1];
        else color[res.tl.substring(0,6)][color[res.tl.substring(0,6)].length] = 4*x+1;
        if(color[res.tr.substring(0,6)] == undefined) color[res.tr.substring(0,6)] = [4*x+2];
        else color[res.tr.substring(0,6)][color[res.tr.substring(0,6)].length] = 4*x+2;
        if(color[res.bl.substring(0,6)] == undefined) color[res.bl.substring(0,6)] = [4*x+3];
        else color[res.bl.substring(0,6)][color[res.bl.substring(0,6)].length] = 4*x+3;
        if(color[res.br.substring(0,6)] == undefined) color[res.br.substring(0,6)] = [4*x+4];
        else color[res.br.substring(0,6)][color[res.br.substring(0,6)].length] = 4*x+4;
        //console.log(color);
    });
}
function sendKeyword(word)
{
    var request = new XMLHttpRequest();
    request.open("POST","tryWord/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("word="+encodeURIComponent(word)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            
        }
    }
}
// CREATE HOVER ANIMATION + HOLD&DRAG + OPTIMISE
var mouseon = false; // is the mouse held
window.addEventListener("mouseup", function(args) {
    var x = (args.x-8)/pixelSize;
    var y = (args.y-8)/pixelSize;
    console.log(x, y);
    for(var i = rects.length-1; i >= 0; i --)
    {
        if(rects[i] != undefined && x > rects[i].x && x < rects[i].x+rects[i].w && y > rects[i].y && y < rects[i].y+rects[i].h)
        {
            divideRect(i);
            i = -1;
        }
    }
}, false);
// END
function init()
{
    checkToken();
    
}
function update()
{
    setTimeout(update, 400);
}
function draw() {
    context.clearRect(0,0,canvas.width, canvas.height);
    context.globalAlpha = 1;
    if(rects != undefined && rects.length != undefined)
    {    
        for(var i = 0; i < rects.length; i ++)
        {
            if(rects[i] != undefined)
            {
                context.globalAlpha = parseInt(rects[i].al,16);
                context.fillStyle = rects[i].c;
                context.fillRect(rects[i].x*pixelSize, rects[i].y*pixelSize, rects[i].w*pixelSize, rects[i].h*pixelSize);
            }
        }
    }
    requestAnimationFrame(draw);
}
init();
update();
draw();