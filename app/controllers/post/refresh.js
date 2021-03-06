var request = require('request');
const sessionExpiry = require('../../../app/functions/refreshSessionExpiryTime.js');
var logType = logger.child({widget : 'session expiry refresh'});

function refresh(req, res) {
    var page = req.body.page;
    var options = {
        url : config.apiURL + '/extendSession?sessionId=' + req.cookies.sessionId,
        method : 'GET',
        json : true
    };

    function callback(err, response) {
        if (!err) {
            logType.info('Response received: ' + response.statusCode);
            if (response.statusCode === 200) {
                sessionExpiry.refreshTime(res, logType);
                res.redirect('/' + page);
            } else {
                logType.error('Error extending backend session expiry time - missing sessionId');
                res.status(500).render('errors/500');
            }
        } else {
            logType.error('Error accessing /extendSession endpoint' + err);
            res.status(500).render('errors/500');
        }
    }

    request(options, callback);
}

module.exports.refresh = refresh;
