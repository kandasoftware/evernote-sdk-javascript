/**
 * Method removes all data from local storage.
 */
function clearStorage() {
    localStorage.clear();
    setIcon();
}

/**
 * Method sets icon that tells user is he logged in or not.
 */
function setIcon() {
    chrome.browserAction.setIcon({path:"../images/icon_19_grey.png"});
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};