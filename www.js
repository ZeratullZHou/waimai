/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 14:55
 */
const express = require('express');
const path = require('path');


const app = express();

app.use('/',express.static(path.join(__dirname,'build')));


app.listen(3000, function() {
    console.log('http://192.168.109.178:3000');
});