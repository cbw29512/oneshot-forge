const fs=require("fs");
const path=require("path");
function fail(message){throw new Error(message)}
function readJson(file){return JSON.parse(fs.readFileSync(file,"utf8"))}
function proficiency(level){return 2+Math.floor((level-1)/4)}
function validate(file){
 try{
  const data=readJson(file);
  if(data.schema!=="oneshot-forge-pregen-progression/0.1")fail("unexpected schema");
  if(!data.ruleset||!data.characterId||!data.anchorPack)fail("identity fields missing");
  const levels=[...(data.levels||[])].sort((a,b)=>a.level-b.level);
  if(!levels.length)fail("no levels");
  levels.forEach((s,i)=>{
   if(s.level!==i+1)fail("levels must be contiguous from 1");
   if(s.proficiency!==proficiency(s.level))fail(`bad proficiency L${s.level}`);
   if(!s.scores||Object.keys(s.scores).length!==6)fail(`six scores required L${s.level}`);
   if(!Number.isInteger(s.hp)||s.hp<1)fail(`invalid HP L${s.level}`);
   if(!s.hitDice||!Array.isArray(s.features)||!Array.isArray(s.attacks))fail(`combat snapshot incomplete L${s.level}`);
   if(!Array.isArray(s.equipment)||!Array.isArray(s.magicItems))fail(`equipment snapshot incomplete L${s.level}`);
  });
  const anchor=levels.find(x=>x.level===data.anchorLevel);
  if(!anchor?.anchor)fail("anchor must be explicitly marked");
  const root=path.resolve(__dirname,"..");
  const pack=readJson(path.join(root,data.anchorPack));
  if(pack.ruleset!==data.ruleset)fail("ruleset differs from anchor pack");
  const character=pack.characters.find(x=>x.id===data.characterId);
  if(!character)fail("anchor character missing");
  for(const key of ["name","className","subclass","race","background","role","alignment","portrait"])
   if(data.identity[key]!==character[key])fail(`identity drift: ${key}`);
  if(JSON.stringify(anchor.scores)!==JSON.stringify(character.scores))fail("anchor scores drifted");
  if(anchor.hp!==character.hp||anchor.hitDice!==character.hitDice||anchor.proficiency!==character.proficiency)fail("anchor combat progression drifted");
  const history=Array.isArray(data.itemHistory)?data.itemHistory:[];
  for(const s of levels){
   const legal=history.filter(x=>x.acquiredLevel<=s.level&&(!x.replacedLevel||x.replacedLevel>s.level)).map(x=>x.name).sort();
   if(JSON.stringify(legal)!==JSON.stringify([...s.magicItems].sort()))fail(`magic-item history mismatch L${s.level}`);
  }
  return levels.length;
 }catch(error){console.error(`Progression validation failed for ${file}: ${error.message}`);throw error}
}
try{
 const dir=path.resolve(__dirname,"..","data","pregens","progression");
 const files=fs.readdirSync(dir).filter(x=>x.endsWith(".json"));
 if(!files.length)fail("no progression files");
 let snapshots=0;
 for(const name of files)snapshots+=validate(path.join(dir,name));
 console.log(`Validated ${files.length} progression file(s), ${snapshots} snapshot(s).`);
}catch(error){console.error("Progression validation stopped.",error);process.exitCode=1}
