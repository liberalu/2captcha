/*jslint browser:true*/
/*global $,require*/
/*expr: true*/

function solveCaptcha(captchaData, apiKey, options) {
    "use strict";

    var page = require("webpage").create();
    var output = {
        "error": false,
        "success": false,
        "errorText": "",
        "captcha": "",
        "time": 0,
        "sendCaptcha": {
            "status": "",
            "captchaId": "",
            "error": false,
            "body": ""
        },
        "resolveCaptcha": {
            "status": "",
            "error": false,
            "body": "",
            "checkNumber": 0
        }
    };
    var settings = {
        timeId: null,
        checkInterval: 3000,
        dfd: new $.Deferred(),
        checkNumber: 20,
        apiKey: apiKey
    };

    function checkCaptchaFailed(errorText) {
        output.error = true;
        output.errorText = errorText;
        output.resolveCaptcha.error = true;
        clearInterval(settings.timeId);
        settings.dfd.reject(output);
    }

    function checkCaptchaSuccess(captcha) {
        clearInterval(settings.timeId);
        output.captcha = captcha;
        output.success = true;
        settings.dfd.resolve(output);
    }

    function checkCaptcha(status) {
        var result = page.plainText.split("|");
        settings.checkNumber -= 1;
        output.resolveCaptcha.body = page.plainText;
        output.resolveCaptcha.status = status;
        output.resolveCaptcha.checkNumber += 1;

        if (result[1] !== undefined && result[0] === "OK") {
            checkCaptchaSuccess(result[1]);
        } else if (page.plainText === "ERROR_KEY_DOES_NOT_EXIST"
                || page.plainText === "ERROR_WRONG_ID_FORMAT"
                || page.plainText === "ERROR_CAPTCHA_UNSOLVABLE"
                || (page.plainText === "CAPCHA_NOT_READY" && settings.checkNumber === 0)) {
            checkCaptchaFailed(page.plainText);
        } else if (status !== "success") {
            checkCaptchaFailed("RESPONSE_STATUS_FAILDED");
        }
    }

    function sendCaptcaFailed(errorText) {
        output.error = true;
        output.errorText = errorText;
        output.sendCaptcha.error = true;
        settings.dfd.reject(output);
    }

    function sendCaptcaSuccess(captchaId) {
        output.sendCaptcha.captchaId = captchaId;
        settings.timeId = setInterval(function () {
            page.open("http://2captcha.com/res.php?key=" + apiKey + "&action=get&id=" + captchaId, checkCaptcha);
        }, settings.checkInterval);
    }

    function sendCaptcha(status) {
        output.sendCaptcha.status = status;
        output.sendCaptcha.body = page.plainText;
        if (status !== "success") {
            sendCaptcaFailed("RESPONSE_STATUS_FAILDED");
        } else {
            var captchaId = page.plainText.split("|")[1];
            if (captchaId !== undefined) {
                sendCaptcaSuccess(captchaId);
            } else {
                sendCaptcaFailed(page.plainText);
            }
        }
    }

    function init() {
        if (options.checkNumber !== undefined) {
            settings.checkNumber = options.checkNumber;
        }

        if (options.checkInterval !== undefined) {
            settings.checkInterval = options.checkInterval;
        }
        page.open("http://2captcha.com/in.php", "POST", "method=base64&key=" + apiKey + "&body=" + encodeURIComponent(captchaData), sendCaptcha);
    }

    init();

    return settings.dfd.promise();
}
