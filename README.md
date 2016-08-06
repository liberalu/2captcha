# 2captcha for phantomjs

Script helps solve captcha for phantomjs.

## Requirement

Script use jQuery library.

## Example

```
phantomjs example/main.js API_KEY | python -m json.tool
```

Or without JSON parsing

```
phantomjs example/main.js  API_KEY
```


## API

### solveCaptcha(imgBase64, apiKey, option) 

**imgBase64**

Type: String

Image content converted to base64 string.

**apiKey**

Type: String

2captcha api key.


**option**

Type: plainObject
options

 - checkNumber - how many times check if captcha solved
 - checkInterval - interval betweens checkin


### License

MIT 

