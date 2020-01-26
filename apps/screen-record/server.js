const express = require("express");
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

var options = {
    root: path.join(__dirname, '.'),
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};


app.use(express.static('.'));

app.get('/api/', (req, res) => {
    res.send({
        'key': "vikas",
        "value": "gourav"
    });
});

app.get('/', (req, res) => res.sendFile('index.html', options));

app.listen(port, function(){
    console.log(`listening on port ${port}`);
});

