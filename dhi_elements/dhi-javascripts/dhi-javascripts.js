// browser detection based on the rules published at
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
// allowedBrowsers is an array with browsers from the browserRules list eg:
//         var ncosAllowedBrowsers = [
//             'Desktop Firefox',
//             'Desktop Chromium',
//             'Mobile Webkit'
//         ]
function checkBrowser(allowedBrowsers) {
    var browserRules = [
        { name: 'Desktop Firefox', must: 'Firefox/', not: 'Seamonkey/' },
        { name: 'Desktop Seamonkey', must: 'Seamonkey', not: 'unused' },
        { name: 'Desktop Chrome', must: 'Chrome/', not: 'Chromium/' },
        { name: 'Desktop Chromium', must: 'Chromium/', not: 'unused' },
        { name: 'Desktop Safari', must: 'Safari/', not: 'Chrome/' },
        { name: 'Desktop Opera', must: 'OPR/', not: 'unused' },
        { name: 'Desktop Internet Explorer', must: '; MSIE ', not: 'unused' },
        { name: 'Mobile Mozilla', must: 'Mobi', not: 'unused' },
        { name: 'Mobile Webkit', must: 'Mobi', not: 'unused' },
        { name: 'Mobile Blink', must: 'Mobi', not: 'unused' },
        { name: 'Mobile Presto', must: 'Mobi', not: 'unused' },
        { name: 'Mobile Internet Explorer', must: 'Mobi', not: 'unused' }
    ]

    foundBrowsers = allowedBrowsers.filter(function(browser){
        var rule = browserRules.filter(function(rule){ return rule.name == browser })[0];

        if(typeof(rule) == 'undefined'){
            throw 'The browser name you supplied is not in the list';
        }

        var mustTest = window.navigator.userAgent.indexOf(rule.must) != -1;
        var notTest = window.navigator.userAgent.indexOf(rule.not) == -1;

        if (mustTest && notTest){
            return browser;
        }
    })

    return foundBrowsers.length > 0;
}

var iso8601 = 'YYYY-MM-DDTHH:mm:ss';
var iso8601NoColons = 'YYYY-MM-DDTHHmmss';

Array.prototype.where = function (filter) {
    var collection = this;

    switch (typeof filter) {
        case 'function':
            return $.grep(collection, filter);
        case 'object':
            for (var property in filter) {
              if(!filter.hasOwnProperty(prop))
                  continue; // ignore inherited properties

              collection = $.grep(collection, function (item) {
                  return item[property] === filter[property];
              });
            }
            return collection.slice(0); // copy the array
                                      // (in case of empty object filter)

        default:
            throw new TypeError('func must be either a' +
                'function or an object of properties and values to filter by');
    }
};

Array.prototype.firstOrDefault = function(func) {
    return this.where(func)[0] || null;
};

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

String.repeat = function (chr, count) {
    var str = "";
    for (var x = 0; x < count; x++) {
        str += chr
    };
    return str;
}

String.prototype.padL = function (width, pad) {
    if (!width || width < 1)
        return this;

    if (!pad) pad = " ";
    var length = width - this.length
    if (length < 1) return this.substr(0, width);

    return (String.repeat(pad, length) + this).substr(0, width);
}

String.prototype.endsWith = function(suffix) {
    return this.lastIndexOf(suffix, this.length - 1) === this.length - suffix.length;
};

String.prototype.replaceEnd = function(suffix, replacement) {
    if (this.endsWith(suffix)) {
        return this.slice(0, -suffix.length) + replacement;
    }
};

String.prototype.padR = function (width, pad) {
    if (!width || width < 1)
        return this;

    if (!pad) pad = " ";
    var length = width - this.length
    if (length < 1) this.substr(0, width);

    return (this + String.repeat(pad, length)).substr(0, width);
}

String.prototype.replaceAll = function(stringToFind, stringToReplace) {
    var temp = this;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Number.prototype.round = function(decimals) {
    if (decimals == 0) {
        return Math.round(this);
    } else {
        var multiplier = Math.pow(10, decimals);
        return Math.round(this * multiplier) / (multiplier);
    }
}

getRequestHeaders = function(user) {
    return {
        'Authorization': 'Basic ' + window.btoa(user.id + ':' + user.password),
        'Content-Type': 'application/json'
    };
}

toObject = function(input) {
    if (!input || input.length === 0) {
        return null;
    }

    if (typeof input === 'object') {
        if (Object.keys(input).length === 0) {
            return null;
        }
        else {
            return input;
        }
    }

    try {
        return JSON.parse(input);
    }
    catch(err) {
        var text = JSON.stringify(input);

        if (text == "{}") {
            return null;
        }

        if (text[0] == "\"") {
            text = text.substr(1, text.length - 2);
        }

        while (text.indexOf("\\n") !== -1) {
            text = text.replace("\\n", "");
        }

        while (text.indexOf("'") !== -1) {
            text = text.replace("'", '"');
        }

        return JSON.parse(text);
    }
}

function geoJsonUtmToLatLng(data, zone, northernHemisphere) {
    for (i = 0; i < data.features.length; i++) {
        for (j = 0; j < data.features[i].geometry.coordinates.length; j++) {
            for (k = 0; k < data.features[i].geometry.coordinates[j].length; k++) {
                var x = data.features[i].geometry.coordinates[j][k][0];
                var y = data.features[i].geometry.coordinates[j][k][1];
                var coords = utmToLatLng(zone, x, y, northernHemisphere);
                data.features[i].geometry.coordinates[j][k][0] = coords.longitude;
                data.features[i].geometry.coordinates[j][k][1] = coords.latitude;
            }
        }
    }
}

/* Begin latLngToUtm */
var pi = 3.14159265358979;
var sm_a = 6378137.0;
var sm_b = 6356752.314;
var sm_EccSquared = 6.69437999013e-03;
var UTMScaleFactor = 0.9996;
function arcLengthOfMeridian(phi)
{
    var alpha, beta, gamma, delta, epsilon, n;
    var result;

    n = (sm_a - sm_b) / (sm_a + sm_b);
    alpha = ((sm_a + sm_b) / 2.0) * (1.0 + (Math.pow (n, 2.0) / 4.0) + (Math.pow (n, 4.0) / 64.0));
    beta = (-3.0 * n / 2.0) + (9.0 * Math.pow (n, 3.0) / 16.0) + (-3.0 * Math.pow (n, 5.0) / 32.0);
    gamma = (15.0 * Math.pow (n, 2.0) / 16.0) + (-15.0 * Math.pow (n, 4.0) / 32.0);
    delta = (-35.0 * Math.pow (n, 3.0) / 48.0) + (105.0 * Math.pow (n, 5.0) / 256.0);
    epsilon = (315.0 * Math.pow (n, 4.0) / 512.0);

    result = alpha
        * (phi + (beta * Math.sin (2.0 * phi))
            + (gamma * Math.sin (4.0 * phi))
            + (delta * Math.sin (6.0 * phi))
            + (epsilon * Math.sin (8.0 * phi)));

    return result;
}

function latLngToUtm(lat, lon) {
    var result = {};
    result.zone = Math.floor((lon + 180.0) / 6) + 1;

    mapLatLonToXY(degToRad(lat), degToRad(lon), degToRad(-183.0 + (result.zone * 6.0)), result);

    /* Adjust easting and northing for UTM system. */
    result.easting = result.easting * UTMScaleFactor + 500000.0;
    result.northing = result.northing * UTMScaleFactor;
    if (result.northing < 0.0) {
        result.northing = result.northing + 10000000.0;
    }

    result.northernHemisphere = lat > 0;

    return result;
}

function degToRad(deg)
{
    return deg / 180.0 * pi
}

function mapLatLonToXY(phi, lambda, lambda0, result)
{
    var N, nu2, ep2, t, t2, l;
    var l3coef, l4coef, l5coef, l6coef, l7coef, l8coef;
    var tmp;

    ep2 = (Math.pow (sm_a, 2.0) - Math.pow (sm_b, 2.0)) / Math.pow (sm_b, 2.0);
    nu2 = ep2 * Math.pow (Math.cos (phi), 2.0);
    N = Math.pow (sm_a, 2.0) / (sm_b * Math.sqrt (1 + nu2));
    t = Math.tan (phi);
    t2 = t * t;
    tmp = (t2 * t2 * t2) - Math.pow (t, 6.0);
    l = lambda - lambda0;
    l3coef = 1.0 - t2 + nu2;
    l4coef = 5.0 - t2 + 9 * nu2 + 4.0 * (nu2 * nu2);
    l5coef = 5.0 - 18.0 * t2 + (t2 * t2) + 14.0 * nu2 - 58.0 * t2 * nu2;
    l6coef = 61.0 - 58.0 * t2 + (t2 * t2) + 270.0 * nu2 - 330.0 * t2 * nu2;
    l7coef = 61.0 - 479.0 * t2 + 179.0 * (t2 * t2) - (t2 * t2 * t2);
    l8coef = 1385.0 - 3111.0 * t2 + 543.0 * (t2 * t2) - (t2 * t2 * t2);

    /* Calculate easting (x) */
    result.easting = N * Math.cos (phi) * l
        + (N / 6.0 * Math.pow(Math.cos(phi), 3.0) * l3coef * Math.pow(l, 3.0))
        + (N / 120.0 * Math.pow(Math.cos(phi), 5.0) * l5coef * Math.pow(l, 5.0))
        + (N / 5040.0 * Math.pow(Math.cos(phi), 7.0) * l7coef * Math.pow(l, 7.0));

    /* Calculate northing (y) */
    result.northing = arcLengthOfMeridian(phi)
        + (t / 2.0 * N * Math.pow(Math.cos(phi), 2.0) * Math.pow(l, 2.0))
        + (t / 24.0 * N * Math.pow(Math.cos(phi), 4.0) * l4coef * Math.pow(l, 4.0))
        + (t / 720.0 * N * Math.pow(Math.cos(phi), 6.0) * l6coef * Math.pow(l, 6.0))
        + (t / 40320.0 * N * Math.pow(Math.cos(phi), 8.0) * l8coef * Math.pow(l, 8.0));
}
/* End latLngToUtm */

function utmToLatLng(zone, easting, northing, northernHemisphere) {
    if (northernHemisphere == undefined) {
        var northernHemisphere = true;
    }

    if (!northernHemisphere) {
        northing = 10000000 - northing;
    }

    var a = 6378137;
    var e = 0.081819191;
    var e1sq = 0.006739497;
    var k0 = 0.9996;

    var arc = northing / k0
    var mu = arc / (a * (1 - Math.pow(e, 2) / 4.0 - 3 * Math.pow(e, 4) / 64.0 - 5 * Math.pow(e, 6) / 256.0));

    var ei = (1 - Math.pow((1 - e * e), (1 / 2.0))) / (1 + Math.pow((1 - e * e), (1 / 2.0)));

    var ca = 3 * ei / 2 - 27 * Math.pow(ei, 3) / 32.0;

    var cb = 21 * Math.pow(ei, 2) / 16 - 55 * Math.pow(ei, 4) / 32;
    var cc = 151 * Math.pow(ei, 3) / 96;
    var cd = 1097 * Math.pow(ei, 4) / 512;
    var phi1 = mu + ca * Math.sin(2 * mu) + cb * Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu);

    var n0 = a / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (1 / 2.0));

    var r0 = a * (1 - e * e) / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (3 / 2.0));
    var fact1 = n0 * Math.tan(phi1) / r0;

    var _a1 = 500000 - easting;
    var dd0 = _a1 / (n0 * k0);
    var fact2 = dd0 * dd0 / 2;

    var t0 = Math.pow(Math.tan(phi1), 2);
    var Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
    var fact3 = (5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4) / 24;

    var fact4 = (61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6) / 720;

    var lof1 = _a1 / (n0 * k0);
    var lof2 = (1 + 2 * t0 + Q0) * Math.pow(dd0, 3) / 6.0;
    var lof3 = (5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 * Math.pow(t0, 2)) * Math.pow(dd0, 5) / 120;
    var _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);
    var _a3 = _a2 * 180 / Math.PI;

    var latitude = 180 * (phi1 - fact1 * (fact2 + fact3 + fact4)) / Math.PI;

    if (!northernHemisphere) {
        latitude = -latitude;
    }

    var longitude = ((zone > 0) && (6 * zone - 183.0) || 3.0) - _a3;

    return { latitude: latitude, longitude: longitude };
}

function queryStringValue(key) {
    var regex = new RegExp("[\\?&]" + key + "([^&#]*)");
    return regex.exec(location.search);
}

function isEmpty(obj) {
    if (!obj) {
        return true;
    }

    if (obj.constructor === Array) {
        return obj.length === 0;
    } else {
        for(var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }
}

function colorToRGB(color) {
    if (color.indexOf('rgb') > -1) {
        return {
            R: color.split('(')[1].split(')')[0].split(',')[0],
            G: color.split('(')[1].split(')')[0].split(',')[1],
            B: color.split('(')[1].split(')')[0].split(',')[2]
        };
    } else {
        return {
            R: parseInt(color.substring(1, 3), 16),
            G: parseInt(color.substring(3, 5), 16),
            B: parseInt(color.substring(5, 7), 16)
        };
    }
}

function scaleColor(color, scale) {
    var color = colorToRGB(color);
    color.R += scale;
    if (color.R > 255) {
        color.R = 255;
    }
    if (color.R < 0) {
        color.R = 0;
    }

    color.G += scale;
    if (color.G > 255) {
        color.G = 255;
    }
    if (color.G < 0) {
        color.G = 0;
    }

    color.B += scale;
    if (color.B > 255) {
        color.B = 255;
    }
    if (color.B < 0) {
        color.B = 0;
    }
    return 'rgb(' + Math.round(color.R) + ', ' + Math.round(color.G) + ', ' + Math.round(color.B) + ')';
}

function opacityColor(color, opacity) {
    var color = colorToRGB(color);
    return 'rgba(' + Math.round(color.R) + ', ' + Math.round(color.G) + ', ' + Math.round(color.B) + ', ' + opacity + ')';
}

function interpolateColor(value, data) {
    for (var i = 0; i < data.length; i++) {
        if (typeof(data[i].value) !== 'number') {
            if (data[i].value.indexOf('<') !== -1) {
                data[i].value = Number(data[i].value.split('<')[1]) - 0.00001;
            }
            else if (data[i].value.indexOf('>') !== -1) {
                data[i].value = Number(data[i].value.split('>')[1]) + 0.00001;
            }
            else {
                data[i].value = Number(data[i].value);
            }
        }
    }

    if (data[0].value < data[1].value && value <= data[0].value ||
        data[0].value > data[1].value && value >= data[0].value) {
        return data[0].color;
    }

    if (data[data.length - 2].value < data[data.length - 1].value && data[data.length - 1].value <= value ||
        data[data.length - 2].value > data[data.length - 1].value && data[data.length - 1].value >= value) {
        return data[data.length - 1].color;
    }

    var startValue;
    var endValue;
    var startColor;
    var endColor;
    var found = false;
    for (var i = 0; i < data.length; i++) {
        if (data[i].value == value) {
            var color = new colorToRGB(data[i].color);
            return 'rgb(' + Math.round(color.R) + ', ' + Math.round(color.G) + ', ' + Math.round(color.B) + ')';
        }

        if (data[i].value <= value && data[i + 1].value >= value)
        {
            startValue = data[i].value;
            endValue = data[i + 1].value;
            startColor = new colorToRGB(data[i].color);
            endColor = new colorToRGB(data[i + 1].color);
            found = true;
            break;
        }
    }

    if (found)
    {
        var percentage = (value - startValue) / (endValue - startValue);
        var r = startColor.R * (1 - percentage) + endColor.R * percentage;
        var g = startColor.G * (1 - percentage) + endColor.G * percentage;
        var b = startColor.B * (1 - percentage) + endColor.B * percentage;
        return 'rgb(' + Math.round(r) + ', ' + Math.round(g) + ', ' + Math.round(b) + ')';
    }
}

function clone(obj) {
    var copy;

    if (null == obj || "object" != typeof obj) {
        return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = this.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = this.clone(obj[attr]);
            }
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function getTimeseriesStatisticsMulti(timeseries) {
    var sum = 0;
    var minimum = 100000000;
    var maximum = -100000000;
    var firstDate = null;
    var lastDate = null;
    var maximum = -100000000;
    var count = 0
    for (var i = 0; i < timeseries.length; i++) {
        var result = getTimeseriesStatistics(timeseries[i]);

        if (!result) {
            continue;
        }

        sum += result.sum;
        if (result.minimum < minimum && result.minimum != null) {
            minimum = result.minimum;
        }

        if (result.maximum > maximum && result.maximum != null) {
            maximum = result.maximum;
        }

        if (!firstDate) {
            firstDate = result.firstDate;
        }
        else {
            if (moment(result.firstDate).isBefore(firstDate)) {
                firstDate = result.firstDate;
            }
        }

        if (!lastDate) {
            lastDate = result.lastDate;
        }
        else {
            if (moment(result.lastDate).isAfter(lastDate)) {
                lastDate = result.lastDate;
            }
        }

        count++;
    }

    return {
        minimum: minimum,
        maximum: maximum,
        sum: sum,
        average: sum / count,
        firstDate: firstDate,
        lastDate: lastDate
    }
}

function getTimeseriesStatistics(timeseries) {
    if (timeseries.data.length == 0) {
        return null;
    }

    var sum = 0;
    var minimum = 100000000;
    var maximum = -100000000;
    for (var i = 0; i < timeseries.data.length; i++) {
        if (timeseries.data[i][1] < minimum && timeseries.data[i][1] != null) {
            minimum = timeseries.data[i][1];
        }

        if (timeseries.data[i][1] > maximum && timeseries.data[i][1] != null) {
            maximum = timeseries.data[i][1];
        }

        sum += timeseries.data[i][1];
    }

    return {
        minimum: minimum,
        maximum: maximum,
        sum: sum,
        average: sum / timeseries.data.length,
        firstDate: timeseries.data[0][0],
        lastDate: timeseries.data[timeseries.data.length - 1][0]
    }
}

function getClosestTimeseriesDateTime(timeseries, id, dateTime) {
    for (var i = 0; i < timeseries.length; i++) {
        if (timeseries[i].id === id) {
            var closest = null;
            var difference = 10000000000;
            for (var j = 0; j < timeseries[i].data.length; j++) {
                if (Math.abs(moment.utc(timeseries[i].data[j][0]).unix() - moment.utc(dateTime).unix()) < difference) {
                    closest = timeseries[i].data[j][0];
                    difference = Math.abs(moment.utc(timeseries[i].data[j][0]).unix() - moment.utc(dateTime).unix());
                }
            }
            return closest;
        }
    }
    return null;
}

function getClosestTimeseriesValue(timeseries, id, dateTime) {
    var closestDateTime = getClosestTimeseriesDateTime(timeseries, id, dateTime);
    return getTimeseriesValue(timeseries, id, closestDateTime);
}

function getTimeseriesValue(timeseries, id, datetime) {
    for (var i = 0; i < timeseries.length; i++) {
        if (timeseries[i].id === id) {
            for (var j = 0; j < timeseries[i].data.length; j++) {
                var tsDateTime = timeseries[i].data[j][0];
                if (tsDateTime === datetime + 'Z') {
                    return timeseries[i].data[j][1];
                }
            }
        }
    }
    return null;
}

function timeseriesSumBetween(timeseries, from, to) {
    var sum = 0;
    for (var i = 0; i < timeseries.data.length; i++) {
        var thisTime = moment(timeseries.data[i][0]);
        if (thisTime.isAfter(from) && thisTime.isBefore(to)) {
            sum += timeseries.data[i][1];
        }
    }
    return sum;
}

function timeseriesMaxBetween(timeseries, from, to) {
    var max = { dateTime: '', value: -999};
    for (var i = 0; i < timeseries.data.length; i++) {
        var thisTime = moment(timeseries.data[i][0]);
        if (thisTime.isAfter(from) && thisTime.isBefore(to)) {
            if (timeseries.data[i][1] > max.value) {
                max = { dateTime: timeseries.data[i][0], value: timeseries.data[i][1] };
            }
        }
    }
    return max;
}

function getIcon(markerType, style) {
    var path = '';
    switch (markerType) {
        case 'circle':
            path = 'M3,12a9,9 0 1,0 18,0a9,9 0 1,0 -18,0';
            break;
        case 'star':
            path = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
            break;
        case 'square':
            path = 'M2 2 L22 2 L22 22 L2 22 Z';
            break;
        case 'triangle':
            path = 'M12 2 L22 23 L2 23 Z';
            break;
        case 'cross':
            path = 'M12 1 L12 24 M1 12 L24 12';
            break;
        case 'line':
            var lineWidth = style.lineWidth || 6;
            var top = 12 - lineWidth / 2;
            var bottom = 12 + lineWidth / 2;
            path = 'M2 ' + top + ' L22 ' + top + ' L22 ' + bottom + ' L2 ' + bottom + ' Z';
            break;
        case 'diamond':
            path = 'M12 2 L20 12 L12 22 L4 12 Z';
            break;
        default:
            break;
    }

    var weight = style && style.weight ? style.weight : 2;
    var color = style && style.color ? style.color : '#1976D2';
    var opacity = style && style.opacity ? style.opacity : '1';
    var fillColor = style && style.fillColor ? style.fillColor : '#1976D2';
    var fillOpacity = style && style.fillOpacity ? style.fillOpacity : '0.3';

    var icon = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24"><path ' +
          'stroke="' + color +
        '" fill="' + fillColor +
        '" fill-opacity="' + fillOpacity +
        '" stroke-width="' + weight +
        '" stroke-opacity="' + opacity +
        '" d="' + path + '"/></svg>';

    if (style && style.lineType) {
        var lineIcon = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24">';
        var pathPrefix = '<path ' + 'stroke="' + color +
            '" fill="' + fillColor +
            '" fill-opacity="' + fillOpacity +
            '" stroke-width="' + weight +
            '" stroke-opacity="' + opacity;
        switch (style.lineType) {
            case 'Dot':
                lineIcon += pathPrefix +
                    '" d=" M 2 9 L 7 9 L 7 15 L 2 15 L 2 9 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 9.5 9 L 14.5 9 L 14.5 15 L 9.5 15 L 9.5 9 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 17 9 L 22 9 L 22 15 L 17 15 L 17 9 Z "/>';
                break;
            case 'Dash':
                lineIcon += pathPrefix +
                    '" d=" M 1 9.5 L 10 9.5 L 10 14.5 L 1 14.5 L 1 9.5 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 14 9.5 L 23 9.5 L 23 14.5 L 14 14.5 L 14 9.5 Z "/>';
                break;
            case 'DashDot':
                lineIcon += pathPrefix +
                    '" d=" M 0 10 L 7 10 L 7 14 L 0 14 L 0 10 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 10 10 L 14 10 L 14 14 L 10 14 L 10 10 L 10 10 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 17 10 L 24 10 L 24 14 L 17 14 L 17 10 Z "/>';
                break;
            case 'DashDotDot':
                lineIcon += pathPrefix +
                    '" d=" M 1 10 L 11 10 L 11 14 L 1 14 L 1 10 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 13 10 L 17 10 L 17 14 L 13 14 L 13 10 Z "/>';
                lineIcon += pathPrefix +
                    '" d=" M 19 10 L 23 10 L 23 14 L 19 14 L 19 10 Z "/>';
                break;
            case 'Solid':
            default:
                // for any other line type we use the default line icon.
                lineIcon = null;
                break;
        }

        if (lineIcon) {
            lineIcon += '</svg>';
            icon = lineIcon;
        }
    }

    return 'data:image/svg+xml;base64,' + window.btoa(icon);
}

function toArray(obj) {
    if (!obj) {
        return [];
    }

    return Object.keys(obj).map(function(key) {
        return {
            name: key,
            value: obj[key],
            type: typeof(obj[key])
        };
    });
}

function merge(obj/*, â€¦*/) {
    for (var i=1; i<arguments.length; i++) {
        for (var prop in arguments[i]) {
            if(arguments[i].hasOwnProperty(prop)){
                var val = arguments[i][prop];
                if (typeof val == "object") // this also applies to arrays or null!
                    merge(obj[prop], val);
                else
                    obj[prop] = val;
            }
        }
    }
    return obj;
}

function passwordStrength(password) {
    var score = 0

    if (!password) {
        return 0;
    }

    // Length 4 or less
    if (password.length < 5) {
        score = score + 3;
    // Length between 5 and 7
    } else if (password.length < 8) {
        score = score + 6;
    // Length between 8 and 15
    } else if (password.length < 16) {
        score = score + 12;
    // Length 16 or more
    } else {
        score = score + 18;
    }

    // At least one lower case letter
    if (password.match(/[a-z]/)) {
        score = score + 1;
    }

    // At least one upper case letter
    if (password.match(/[A-Z]/)) {
        score = score + 5;
    }

    // At least one number
    if (password.match(/\d+/)) {
        score = score + 5;
    }

    // At least three numbers
    if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score = score + 5;
    }

    // At least one special character
    if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) {
        score = score + 5;
    }

    // Aat least two special characters
    if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
        score = score + 5;
    }

    // Combinations both upper and lower case
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score = score + 2;
    }

    // Both letters and numbers
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score = score + 2;
    }

    // Letters, numbers, and special characters
    if (password.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) {
        score = score + 2;
    }

    if (score < 16) {
       return 0;
    } else if (score < 25) {
       return 1;
    } else if (score < 35) {
       return 2;
    } else if (score < 45) {
       return 3;
    }
}

function getOffset(container) {
    function accumulateOffset(nextContainer, isX) {
        var offset = 0;
        while (nextContainer != null) {
            offset += isX ? nextContainer.offsetLeft : nextContainer.offsetTop;
            nextContainer = nextContainer.offsetParent;
        }
        return offset;
    }

    return {
        x: accumulateOffset(container, true),
        y: accumulateOffset(container, false)
    }
}

var MaterialDesignColors = function(order) {
    this._order = order ? order : [
        'red',
        'blue',
        'green',
        'amber',
        'grey',
        'purple',
        'cyan',
        'deeporange',
        'teal',
        'deeppurple',
        'pink',
        'lime',
        'indigo',
        'yellow',
        'lightblue',
        'lightgreen',
        'orange',
        'bluegrey'
    ];

    this._materialDesignColors = {
        red: {
            c50: '#ffebee',
            c100: '#ffcdd2',
            c200: '#ef9a9a',
            c300: '#e57373',
            c400: '#ef5350',
            c500: '#f44336',
            c600: '#e53935',
            c700: '#d32f2f',
            c800: '#c62828',
            c900: '#b71c1c'
        },
        pink: {
            c50: '#fce4ec',
            c100: '#f8bbd0',
            c200: '#f48fb1',
            c300: '#f06292',
            c400: '#ec407a',
            c500: '#e91e63',
            c600: '#d81b60',
            c700: '#c2185b',
            c800: '#ad1457',
            c900: '#880e4f'
        },
        purple: {
            c50: '#f3e5f5',
            c100: '#e1bee7',
            c200: '#ce93d8',
            c300: '#ba68c8',
            c400: '#ab47bc',
            c500: '#9c27b0',
            c600: '#8e24aa',
            c700: '#7b1fa2',
            c800: '#6a1b9a',
            c900: '#4a148c'
        },
        deeppurple: {
            c50: '#ede7f6',
            c100: '#d1c4e9',
            c200: '#b39ddb',
            c300: '#9575cd',
            c400: '#7e57c2',
            c500: '#673ab7',
            c600: '#5e35b1',
            c700: '#512da8',
            c800: '#4527a0',
            c900: '#311b92'
        },
        indigo: {
            c50: '#e8eaf6',
            c100: '#c5cae9',
            c200: '#9fa8da',
            c300: '#7986cb',
            c400: '#5c6bc0',
            c500: '#3f51b5',
            c600: '#3949ab',
            c700: '#303f9f',
            c800: '#283593',
            c900: '#1a237e'
        },
        blue: {
            c50: '#e3f2fd',
            c100: '#bbdefb',
            c200: '#90caf9',
            c300: '#64b5f6',
            c400: '#42a5f5',
            c500: '#2196f3',
            c600: '#1e88e5',
            c700: '#1976d2',
            c800: '#1565c0',
            c900: '#0d47a1'
        },
        lightblue: {
            c50: '#e1f5fe',
            c100: '#b3e5fc',
            c200: '#81d4fa',
            c300: '#4fc3f7',
            c400: '#29b6f6',
            c500: '#03a9f4',
            c600: '#039be5',
            c700: '#0288d1',
            c800: '#0277bd',
            c900: '#01579b'
        },
        cyan: {
            c50: '#e0f7fa',
            c100: '#b2ebf2',
            c200: '#80deea',
            c300: '#4dd0e1',
            c400: '#26c6da',
            c500: '#00bcd4',
            c600: '#00acc1',
            c700: '#0097a7',
            c800: '#00838f',
            c900: '#006064'
        },
        teal: {
            c50: '#e0f2f1',
            c100: '#b2dfdb',
            c200: '#80cbc4',
            c300: '#4db6ac',
            c400: '#26a69a',
            c500: '#009688',
            c600: '#00897b',
            c700: '#00796b',
            c800: '#00695c',
            c900: '#004d40'
        },
        green: {
            c50: '#e8f5e9',
            c100: '#c8e6c9',
            c200: '#a5d6a7',
            c300: '#81c784',
            c400: '#66bb6a',
            c500: '#4caf50',
            c600: '#43a047',
            c700: '#388e3c',
            c800: '#2e7d32',
            c900: '#1b5e20'
        },
        lightgreen: {
            c50: '#f1f8e9',
            c100: '#dcedc8',
            c200: '#c5e1a5',
            c300: '#aed581',
            c400: '#9ccc65',
            c500: '#8bc34a',
            c600: '#7cb342',
            c700: '#689f38',
            c800: '#558b2f',
            c900: '#33691e'
        },
        lime: {
            c50: '#f9fbe7',
            c100: '#f0f4c3',
            c200: '#e6ee9c',
            c300: '#dce775',
            c400: '#d4e157',
            c500: '#cddc39',
            c600: '#c0ca33',
            c700: '#afb42b',
            c800: '#9e9d24',
            c900: '#827717'
        },
        yellow: {
            c50: '#fffde7',
            c100: '#fff9c4',
            c200: '#fff59d',
            c300: '#fff176',
            c400: '#ffee58',
            c500: '#ffeb3b',
            c600: '#fdd835',
            c700: '#fbc02d',
            c800: '#f9a825',
            c900: '#f57f17'
        },
        amber: {
            c50: '#fff8e1',
            c100: '#ffecb3',
            c200: '#ffe082',
            c300: '#ffd54f',
            c400: '#ffca28',
            c500: '#ffc107',
            c600: '#ffb300',
            c700: '#ffa000',
            c800: '#ff8f00',
            c900: '#ff6f00'
        },
        orange: {
            c50: '#fff3e0',
            c100: '#ffe0b2',
            c200: '#ffcc80',
            c300: '#ffb74d',
            c400: '#ffa726',
            c500: '#ff9800',
            c600: '#fb8c00',
            c700: '#f57c00',
            c800: '#ef6c00',
            c900: '#e65100'
        },
        deeporange: {
            c50: '#fbe9e7',
            c100: '#ffccbc',
            c200: '#ffab91',
            c300: '#ff8a65',
            c400: '#ff7043',
            c500: '#ff5722',
            c600: '#f4511e',
            c700: '#e64a19',
            c800: '#d84315',
            c900: '#bf360c'
        },
        grey: {
            c50: '#fafafa',
            c100: '#f5f5f5',
            c200: '#eeeeee',
            c300: '#e0e0e0',
            c400: '#bdbdbd',
            c500: '#9e9e9e',
            c600: '#757575',
            c700: '#616161',
            c800: '#424242',
            c900: '#212121'
        },
        bluegrey: {
            c50: '#eceff1',
            c100: '#cfd8dc',
            c200: '#b0bec5',
            c300: '#90a4ae',
            c400: '#78909c',
            c500: '#607d8b',
            c600: '#546e7a',
            c700: '#455a64',
            c800: '#37474f',
            c900: '#263238'
        }
    }
}

MaterialDesignColors.prototype.getColorByIntensityAndName = function(intensity, name) {
    return this._materialDesignColors[name][intensity];
}

MaterialDesignColors.prototype.getColorByIntensityAndColorIndex = function(intensity, colorIndex) {
    var ci = colorIndex - Math.floor(colorIndex / this._order.length) * this._order.length;
    return this.getColorByIntensityAndName(intensity, this._order[ci]);
}

MaterialDesignColors.prototype.getColorByIntensityIndexAndColorIndex = function(intensityIndex, colorIndex) {
    var ci = colorIndex - Math.floor(colorIndex / this._order.length) * this._order.length;
    var keys = Object.keys(this._materialDesignColors[this._order[ci]]);
    var ii = intensityIndex - Math.floor(intensityIndex / keys.length) * keys.length;
    return this.getColorByIntensityAndColorIndex(keys[ii], ci);
}

function parseTimespan(timeSpan) {
    var momentTimeSpan =[];
    var now = moment().utc().set({minute: 10 * (moment().utc().minute() / 10).round(0), second:0, millisecond:0});
    if (timeSpan.type == 'RelativeToNow') {
        momentTimeSpan.start = moment(now).add(timeSpan.start, 'days');
        momentTimeSpan.end = moment(now).add(timeSpan.end, 'days');
        return momentTimeSpan;
    } else if (timeSpan.type == 'Fixed') {
        momentTimeSpan.start = moment(timeSpan.start);
        momentTimeSpan.end = moment(timeSpan.end);
        return momentTimeSpan;
    } else if (timeSpan.type == 'RelativeToData') {
        return timeSpan;
    };
}
