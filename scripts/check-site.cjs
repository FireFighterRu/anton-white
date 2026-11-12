const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../docs');let errors=[],links=0;
function htmlPages(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{const file=path.join(dir,item.name);return item.isDirectory()?htmlPages(file):item.name.endsWith('.html')?[path.relative(root,file)]:[]})}
const pages=htmlPages(root);
for(const page of pages){
 const file=path.join(root,page),html=fs.readFileSync(file,'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(page+': duplicate ID');
 for(const [,url] of html.matchAll(/\b(?:href|src|data-image)="([^"]*)"/g)){
  if(!url||/^(?:https?:|tel:|sms:|mailto:|data:)/.test(url))continue;
  const [relativeWithQuery,fragment]=url.split('#');const relative=relativeWithQuery.split('?')[0];let target=relative?path.resolve(path.dirname(file),relative):file;
  if(relative.endsWith('/'))target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(page+': missing '+url);continue}
  if(fragment&&path.extname(target)==='.html'&&!fs.readFileSync(target,'utf8').includes('id="'+fragment+'"'))errors.push(page+': missing anchor '+url);
  links++;
 }
}
function checkJs(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())checkJs(file);else if(item.name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status)errors.push(result.stderr)}}}
checkJs(root);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(pages.length+' pages, '+links+' local links/assets, JavaScript syntax: OK');
