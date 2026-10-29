import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const host='https://99centoneshot.netlify.app';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
function walk(dir=''){
  const found=[];
  for(const ent of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    const p=path.posix.join(dir,ent.name);
    if(ent.isDirectory()&& !['node_modules','.git'].includes(ent.name))found.push(...walk(p));
    else if(ent.isFile()&&p.endsWith('.html'))found.push(p);
  }
  return found;
}
const files=walk();
let canonicalCount=0;
for(const rel of files){
  const html=read(rel);
  const match=html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if(!match)continue;
  canonicalCount++;
  const expected=host+'/'+(rel==='index.html'?'':rel);
  if(match[1]!==expected)failures.push(rel+': canonical is '+match[1]+' expected '+expected);
}
if(canonicalCount<15)failures.push('Too few canonical pages checked: '+canonicalCount);
const robots=read('robots.txt'),sitemap=read('sitemap.xml');
if(!robots.includes('Sitemap: '+host+'/sitemap.xml'))failures.push('robots.txt does not advertise production sitemap');
for(const [_,url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)){
  if(!url.startsWith(host+'/'))failures.push('Sitemap points at non-production host: '+url);
  else{
    const rel=url.slice(host.length+1)||'index.html';
    if(!fs.existsSync(path.join(root,rel)))failures.push('Sitemap URL has no source file: '+rel);
  }
}
const home=read('index.html'),products=JSON.parse(read('data/products.json')).products;
if((home.match(/https:\/\/buymeacoffee\.com\/divclass016/g)||[]).length!==1)failures.push('Homepage must have one and only one support link');
if(!/class="land-nav"[\s\S]*?href="https:\/\/buymeacoffee\.com\/divclass016"/.test(home))failures.push('Support link must be in homepage navigation');
if(!home.includes('No purchases yet.'))failures.push('No-checkout status must be clear');
if(products.some(p=>p.sellable))failures.push('Product contract has sellable products; review storefront sales copy before publishing');
const privacy=read('privacy.html');
if(!privacy.includes('localStorage')||!privacy.includes('Google Fonts'))failures.push('Privacy notice must cover local progress and external typography');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('PASS: '+canonicalCount+' canonical pages, sitemap, checkout copy, support link, privacy notice');
