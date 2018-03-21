function completePage(req, res) {
    var textPromptMessage;

    if (typeof req.cookies.textMessage !== 'undefined') {
        textPromptMessage = true;
    } else {
        textPromptMessage = false;
    }

    res.render('complete', {
        version : config.version,
        timeStamp : Date.now(),
        textPrompt : textPromptMessage,
        environment : config.nodeEnvironment,
        viewedMessage : req.cookies.cookies_agreed,
        sessionId : req.cookies.sessionId,
        currentPage : 'complete'
    });

    // Make sure the cookies are cleared AFTER page render, so GA can get values, but cleared for security
    res.clearCookie('sessionId');
    res.clearCookie('exp');
    res.clearCookie('retry');
    logger.info('Cleared Session ID');
    logger.info('Process Complete');
}
module.exports.completePage = completePage;
