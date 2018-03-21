var request = require('request');
var multer = require('multer');
var logger = require(appRootDirectory + '/app/functions/bunyan');
var encoder = require(appRootDirectory + '/app/functions/base64Encode');
var checkHoneypot = require(appRootDirectory + '/app/functions/honeypot');
var hasTimedOut = require(appRootDirectory + '/app/functions/timeoutRedirect');

function photoUploader(req, res) {
    var userPhotoEncoded;
    var redirectUrl;
    var passedHoneypot;
    var fakeImageNameRaw;
    var fitnote;
    var options;
    var logType = logger.child({widget : 'photoUploader'});
    var storage = multer.memoryStorage();
    var upload = multer({storage : storage}).single('userPhoto');
    var route = typeof req.cookies.route !== 'undefined' ? req.cookies.route : 'take';
    var errUrl = (route === 'upload') ? '/422-desktop' : '/422';

    function processFormRequest(url) {
        logType.info('Submitted image successfully');
        return res.redirect(url);
    }

    function handleCriticalFormError(err, msg) {
        logType.fatal({err : err}, msg);
        return res.status(500).render('errors/500');
    }

    function uploadCallback(err) {
        function encodeImage() {
            if (typeof req.file !== 'undefined') {
                return encoder.convertBase64(req.file.buffer);
            } else {
                return '';
            }
        }

        function callback(error, response) {
            if (!error && userPhotoEncoded !== '') {
                switch (response.statusCode) {
                case 201:
                case 202:
                    processFormRequest('/photo-audit');
                    break;
                default:
                    handleCriticalFormError(err, 'API not responding');
                }
            } else if (userPhotoEncoded === '') {
                logType.debug({err : err}, 'No photo submitted');
                res.redirect(`/${route}-a-photo?error=noPhoto`);
            }
        }

        if (err) {
            res.render(`${route}-a-photo`, {error : {message : req.i18nTranslator.t('take-a-photo:connection')}});
            logType.error({err : err}, 'Problem uploading image');
            return;
        } else if (typeof req.cookies.sessionId !== 'undefined') {
            fakeImageNameRaw = req.body.imageNameField;
            passedHoneypot = checkHoneypot.honeypot(fakeImageNameRaw, 'BOT: honeypot detected a bot, Take a Photo Page, ImageName Field');
            req.visitor.event('Honeypot', 'imageNameID', 'Bot', {'dimension4' : 1});
            logType.info('Passed Honeypot ' + passedHoneypot);

            if (passedHoneypot === false) {
                logType.info('BOT detected. Doing fake send');
                userPhotoEncoded = null; //Try not to keep base64 strings hanging around in memory.
                res.redirect('/nino'); // don't post the request just go to the next page.
            } else {
                if (typeof req.file !== 'undefined' && 
                    req.file.size < config.minFileSize && 
                    req.file.mimetype !== 'application/pdf') {
                    res.redirect(errUrl);
                    return;
                }

                userPhotoEncoded = encodeImage();
                logType.info('Image Encoded');
                logType.info('Starting image upload');

                fitnote = {
                    sessionId : req.cookies.sessionId,
                    image : userPhotoEncoded
                };

                options = {
                    url : config.apiURL + '/photo',
                    method : 'POST',
                    json : true,
                    headers : {
                        'Accept' : 'application/json',
                        'content-type' : 'application/json'
                    },
                    agentOptions : {
                        keepAlive : true
                    },
                    timeout : 240000,
                    body : fitnote
                };

                request(options, callback);
            }
        } else {
            redirectUrl = hasTimedOut.redirectTimeout('no valid session');
            res.redirect(redirectUrl);
        }
    }
    upload(req, res, uploadCallback);
}

module.exports.photoUploader = photoUploader;