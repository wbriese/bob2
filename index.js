'use strict';

require('dotenv').config();

const Koa = require('koa');
const app = new Koa();
const router = require('./router');
const fs=require('fs');

const html =fs.readFileSync('notFound.html','utf-8');
const PORT = process.env.PORT;


/* fs.readdir('./', function (err, files) {
  //handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 
  //listing all files using forEach
  files.forEach(function (file) {
    // Do whatever you want to do with the file
    console.log(file); 
  });
}); */

app.use(require('koa-static')(__dirname));

app.use(async (ctx,next)=>{
  await next();
  if (ctx.status===404) {
    ctx.body=html;
    ctx.status=404;}
});
app.use(router.routes());



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // eslint-disable-line no-console 
});
