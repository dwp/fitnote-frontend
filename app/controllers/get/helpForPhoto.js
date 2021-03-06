function getRoute(req) {
    return (typeof req.cookies.route !== 'undefined') ? req.cookies.route : 'upload';
}

function helpForPhotoStep1Page(req, res) {
    var page = 'photo-help/help-for-photo-1';
    res.render(page, {
        route : getRoute(req),
        sessionId : req.cookies.sessionId,
        timeStamp : Date.now(),
        currentPage : page,
        version : config.version,
        viewedMessage : req.cookies.cookies_agreed
    });
}

function helpForPhotoStep2Page(req, res) {
    var page = 'photo-help/help-for-photo-2';
    res.render(page, {
        route : getRoute(req),
        sessionId : req.cookies.sessionId,
        timeStamp : Date.now(),
        currentPage : page,
        version : config.version,
        viewedMessage : req.cookies.cookies_agreed
    });
}
function helpForPhotoStep3Page(req, res) {
    var page = 'photo-help/help-for-photo-3';
    res.render(page, {
        route : getRoute(req),
        sessionId : req.cookies.sessionId,
        timeStamp : Date.now(),
        currentPage : page,
        version : config.version,
        viewedMessage : req.cookies.cookies_agreed
    });
}
function helpForPhotoStep4Page(req, res) {
    var page = 'photo-help/help-for-photo-4';
    res.render(page, {
        route : getRoute(req),
        sessionId : req.cookies.sessionId,
        timeStamp : Date.now(),
        currentPage : page,
        version : config.version,
        viewedMessage : req.cookies.cookies_agreed
    });
}
function helpForPhotoStep5Page(req, res) {
    var page = 'photo-help/help-for-photo-5';
    res.render(page, {
        route : getRoute(req),
        sessionId : req.cookies.sessionId,
        timeStamp : Date.now(),
        currentPage : page,
        version : config.version,
        viewedMessage : req.cookies.cookies_agreed
    });
}
module.exports = {
    helpForPhotoStep1Page,
    helpForPhotoStep2Page,
    helpForPhotoStep3Page,
    helpForPhotoStep4Page,
    helpForPhotoStep5Page
};
