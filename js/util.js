const RAD_TO_DEG = 180/Math.PI;

function radToDeg(angle) { return angle * RAD_TO_DEG; }
function degToRad(angle) { return angle / RAD_TO_DEG; }

createjs.Bitmap.prototype.scale = function(scale)
{
    this.scaleX *= scale;
    this.scaleY *= scale;
}

createjs.Bitmap.prototype.recenter = function()
{
    this.regX = this.image.width/2;
    this.regY = this.image.height/2;
}

var urlParams = {};
(function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }
})();


function randomRange(lo, hi)
{
    var r = Math.random();
    r = (hi - lo) * r + lo;
    return r;
}

// conventional orientation on a trigonometric circle
// game orientation  |  conventional
//        0 degrees     90 degrees (PI/2)
//       90 degrees      0 degrees (0)
//      180 degrees    -90 degrees (-PI/2)
//      270 degrees    180 degrees (PI)
function conventionalOrientation(gameOrientation)
{
    return -gameOrientation + 90;
}

// return signed angle between vectors in radians
function signedAngleBetweenVectors(v1, v2)
{
    //signed_angle = atan2(b.y,b.x) - atan2(a.y,a.x)
    return Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
}