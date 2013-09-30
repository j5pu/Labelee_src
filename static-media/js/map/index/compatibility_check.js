var ua = navigator.userAgent;
var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));


var device = {

    isIncompatibleAndroid: function() {
        return navigator.userAgent.match(/Android/i) && androidversion < 2.2;
    },

    isIncompatibleBlackberry: function() {
        // We accept only BB10 (userAgent.match(/BB10/i)). Others are discarded
        return navigator.userAgent.match(/BlackBerry/i);
    },

    isIncompatibleWindows: function() {
        var windowsVersion = parseFloat(ua.slice(ua.indexOf("Windows Phone OS")+17));
        return navigator.userAgent.match(/Windows Phone/i) && !(windowsVersion >= 8);
    },

    isIncompatibleIExplorer: function() {
        var explorerVersion = parseFloat(ua.slice(ua.indexOf("MSIE")+5));
        return navigator.userAgent.match(/MSIE/i) && explorerVersion < 9;
    },

    isIncompatibleSymbian: function() {
        return navigator.userAgent.match(/Symbian/i);
    },


    isCompatibleBlackBerry: function() {
        // Only works with the latest version: BlackBerry 10
        return navigator.userAgent.match(/BB10/i);
    },

    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },

    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },

    Windows: function() {
        return navigator.userAgent.match(/Windows Phone/i) && windowsversion >= 8;
    },

    Chrome: function() {
        return navigator.userAgent.match(/Chrome/i);
    },
    isAny: function() {
        return (device.Android() || device.BlackBerry() || device.iOS() || device.Opera() || device.Windows());
    },


    isIncompatible: function() {
        // Sólo los compatibles con la aplicación
        return (device.isIncompatibleAndroid() || device.isIncompatibleWindows() || device.isIncompatibleBlackberry() ||
            device.isIncompatibleIExplorer() || device.isIncompatibleSymbian())
    }
};


/*
 Device compatibility check: it must be executed prior to anything else, and it shouldn't be run via Jquery,
 as some of the devices have problems with it
 */
if(device.isIncompatible())
{

    // Redirect to incompatible devices page
    // Get url without "Http://" and add the corresponding redirection
    var httpParts = window.location.href.split("http://");
    var urlParts = httpParts[httpParts.length - 1].split("/");
    var enclosureId = urlParts[urlParts.length - 1].split("_")[0];
    var newUrl = "http://" + urlParts[0] + "/map/incompatible-devices/" + enclosureId;
    window.location.assign(newUrl);
    throw "stop execution";
}

