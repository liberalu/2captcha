var page = require('webpage').create();
var system = require('system');
var apiKey = '';
phantom.page.injectJs('./../2captcha.js');
phantom.page.injectJs('./jquery-3.1.0.min.js');

if (system.args[1] === undefined) {
    console.log('Please write api key');
    phantom.exit(0);
}

apiKey = system.args[1];

function getCaptchaBase64(selector) {
    var dimension = page.evaluate(function(selector) {
        var image = jQuery(selector);
        if (image.length === 0) {
            return false;
        } else {
            return {
                top:    image.offset().top,
                left:   image.offset().left,
                width:  image.width(),
                height: image.height()
            };
        };
    }, selector);

    if (!dimension) {
        return false;
    }
    page.clipRect = dimension;
    page.render('captcha.png');
    return  page.renderBase64('PNG');
}

function solveCaptchaSuccess(captchaText) {
    console.log(JSON.stringify(captchaText));
    phantom.exit(0);
}

function solveCaptchaFail(captchaText) {
    console.log(JSON.stringify(captchaText));
    phantom.exit(0);
}

page.viewportSize = { width: 1920, height: 1080 };
page.open('https://www.phpcaptcha.org/try-securimage/', function() {
    var imgBase64 = getCaptchaBase64("img#captcha_one");
    if (!imgBase64) {
        console.log('Can not get captcha');
        phantom.exit(0);
    }
    setTimeout(function() {
        solveCaptcha(imgBase64, apiKey, {checkNumber: 100, checkInterval: 1000}).then(solveCaptchaSuccess, solveCaptchaFail);
    }, 1);
});
