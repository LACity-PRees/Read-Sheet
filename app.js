const https = require('https');
const fs = require('fs');

//get this value from the Oauth playground
const refreshToken2='1/uMZUMZUyKGvJHvPWgbf4nFVIEg5uL8EU_Y1SIhTDiwqjHWWmweMe5bgi32WS4K0F' 

let accessToken=null; 

//sheet documentID
const documentID='1Ot_cVBTx64nBizFu6k64P0M4MVuMeCOV8yAOR2v0NQw'  
//name of the sheet.  need to escape spaces
const sheetName='Form_Responses';                                          

/*
You get the information above from the URL where you can edit your google sheet.

https://sheets.googleapis.com/v4/spreadsheets/{DOCUMENT ID}/values/Sheet1

*/

function request(options, body) {
    return new Promise((resolve, reject) => {
        var req = https.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.end(body);
    });
    
}

function getAccessToken() {

    var options = {
        host: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    
    var body = {
        //created with google oauth playground
        //https://developers.google.com/oauthplayground/
        client_id: "1057444077698-3onsqqrqvgg3nev3a5i8uehul7d7ck38.apps.googleusercontent.com",
        client_secret: "NVO2EJyJCxm5KP-Y5CvMfdkh",
        grant_type: 'refresh_token',
        refresh_token: refreshToken2
    };

    return request(options, JSON.stringify(body)).then((data) => {
        accessToken = data.access_token;
    });
}

function googleSheetsReq(options){
	let path='/v4/spreadsheets/'+documentID+'/values/'+ sheetName;
	    path += '?access_token=' + accessToken;

	    var requestOptions = {
        host: 'sheets.googleapis.com',
        path: path,
        method: options.method,
        headers: options.headers,
        parameters: options.parameters
    };
    return request(requestOptions, options.body);

}

var i=0;


//get data on run.
getAccessToken().then( ()=>{
    return googleSheetsReq({
        method: 'GET',
        parameters: 'Form_Responses'
    });   

}).then((data)=>{
//do things here. 
//data.values contains the values of the json object from the sheet
//console.log(data.values);
console.log(i);
i++;
fs.writeFileSync('Node/data.json', JSON.stringify(data.values), 'utf-8');




}).catch((e) => {
if (e.isNotError) {
    console.log(e.message);
} else {
    console.error(e);
}
});

setInterval(function() {

    getAccessToken().then( ()=>{
            return googleSheetsReq({
                method: 'GET',
                parameters: 'Form_Responses'
            });   

    }).then((data)=>{
        //do things here. 
        //data.values contains the values of the json object from the sheet
        //console.log(data.values);
        console.log(i);
        i++;
        fs.writeFileSync('Node/data.json', JSON.stringify(data.values), 'utf-8');
        



    }).catch((e) => {
        if (e.isNotError) {
            console.log(e.message);
        } else {
            console.error(e);
        }
    });

    // interval in milliseconds (1000 = 1 second)
}, 10000);  