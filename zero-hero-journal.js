(() => {
"use strict";
const STORAGE="oneshot-forge:zero-hero-journal:v1";
const YEARS=[
 {age:12,title:"Spring Chore Day",focus:"First responsibility",prompt:"When did adults first treat you as useful instead of little?"},
 {age:13,title:"Spring Dance",focus:"Belonging and embarrassment",prompt:"Who mattered to you when nobody was assigning you a job?"},
 {age:14,title:"Harvest Fair & Team Games",focus:"Competition and sportsmanship",prompt:"What did winning or losing reveal about you?"},
 {age:15,title:"Apprentice Week",focus:"Work and mentorship",prompt:"What did a mentor teach you that stayed with you?"},
 {age:16,title:"Road to Bellmere",focus:"Independence",prompt:"What changed the first time home was behind you?"},
 {age:17,title:"The Long Storm",focus:"Responsibility under real danger",prompt:"What did you choose when Hearthcross could not save everything?"},
 {age:18,title:"The Last Spring Dance",focus:"Who you became",prompt:"What part of childhood did you carry into adulthood?"}
];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let state={};
try{state=JSON.parse(localStorage.getItem(STORAGE)||"{}")||{};}catch{}
function val(key){return esc(state[key]||"");}
function field(key,label,rows=1,placeholder=""){
 const tag=rows>1?'<textarea data-key="'+key+'" rows="'+rows+'" placeholder="'+esc(placeholder)+'">'+val(key)+'</textarea>':'<input data-key="'+key+'" value="'+val(key)+'" placeholder="'+esc(placeholder)+'">';
 return '<label><span>'+label+'</span>'+tag+'</label>';
}
function pageHead(kicker,title,sub=""){return '<header class="journal-page-head"><p>'+kicker+'</p><h2>'+title+'</h2>'+(sub?'<span>'+sub+'</span>':"")+'</header>';}
function milestone(age,i){return '<article class="milestone-slot"><div class="card-placeholder"><strong>Milestone card '+i+'</strong><span>Tape / paste / write title here</span></div>'+field('y'+age+'m'+i,'What happened?',2,'Winner, failure, joke award, lesson…')+'</article>';}
function cover(){
 return '<section class="journal-page cover-page">'+pageHead("FROM ZERO TO HERO","My Hearthcross Years","Ages 12–18")+
 '<div class="cover-name">'+field("name","Character name")+field("race","Race / species")+field("player","Player")+'</div>'+
 '<div class="cover-art-box"><span>Draw your age-12 character, paste a portrait, or add a symbol that represents home.</span></div>'+
 '<div class="cover-grid">'+field("family","Family / guardians",3)+field("home","What home feels like",3)+field("chores","Childhood work / chores",3)+field("aspiration12","At age 12, I wanted to become…",3)+'</div>'+
 '<footer>Hearthcross · Level-0 origin journal</footer></section>';
}
function yearPage(y){
 return '<section class="journal-page year-page">'+pageHead('AGE '+y.age,y.title,y.focus)+
 '<blockquote>'+y.prompt+'</blockquote>'+
 '<div class="milestone-grid">'+milestone(y.age,1)+milestone(y.age,2)+milestone(y.age,3)+'</div>'+
 '<div class="year-reflection">'+
 field('y'+y.age+'memory','The memory I will keep',3)+
 field('y'+y.age+'lesson','The hardest lesson',3)+
 field('y'+y.age+'relationship','A relationship that changed',3)+
 field('y'+y.age+'aspiration','My aspiration: same, changed, or uncertain?',3)+
 field('y'+y.age+'village','What changed in Hearthcross',3)+
 field('y'+y.age+'sketch','Sketch / extra note',4)+
 '</div><footer>Year '+(y.age-11)+' of 7 · '+y.title+'</footer></section>';
}
function peoplePage(){
 return '<section class="journal-page">'+pageHead("PEOPLE","The people who shaped me","Friends · rivals · family · mentors")+
 '<div class="people-grid">'+
 field("friend","A friend who changed me",4)+field("rival","A rival who changed me",4)+field("mentor","A mentor I listened to",4)+field("familychange","How family changed as I grew",4)+field("someoneleft","Someone I lost, left, or grew apart from",4)+field("someonegained","Someone I did not expect to matter",4)+
 '</div>'+
 '<div class="relationship-lines"><h3>Names I want to remember</h3>'+Array.from({length:8},(_,i)=>field("person"+i,"",1,"Name · relationship · one memory")).join("")+'</div>'+
 '<footer>The people in the scrapbook matter as much as the numbers.</footer></section>';
}
function legacyPage(){
 return '<section class="journal-page">'+pageHead("WHAT I CARRY","Marks left by seven years","Possessions · scars · reputation · choices")+
 '<div class="legacy-grid">'+field("possessions","Objects and heirlooms that gained meaning",5)+field("scars","Scars, injuries, or physical reminders",5)+field("reputation","What Hearthcross thinks of me",5)+field("choices","Choices I still defend or regret",5)+field("familiarities","Things I practiced even if they are not RAW proficiencies",5)+field("places","Places in Hearthcross that became mine",5)+'</div>'+
 '<footer>History is not automatically a mechanical proficiency. It is still part of the character.</footer></section>';
}
function finalPage(){
 return '<section class="journal-page final-page">'+pageHead("GRADUATION","Who I Became","Age 18")+
 '<div class="final-question">'+field("became","Looking back, who did I become?",6)+field("surprised","What about me would surprise my age-12 self?",5)+field("leaving","What am I leaving Hearthcross to do—or why am I staying?",5)+field("keep","Which scrapbook card means the most to me?",4)+'</div>'+
 '<div class="final-lock"><h3>Level-0 journey complete</h3><p>Final base array value: ______ / 30</p><p>Rules edition: □ 2014 &nbsp;&nbsp; □ 2024</p><p>Race/species retained: ______________________________</p><p>Class chosen at graduation: ______________________________</p></div>'+
 '<blockquote>“The character sheet tells me who I am now. The scrapbook tells me how I became that person.”</blockquote>'+
 '<footer>Print the Coming-of-Age Certificate and Origin Chronicle after the Level-0 array is frozen.</footer></section>';
}
function render(){
 document.getElementById("journal-host").innerHTML=cover()+YEARS.map(yearPage).join("")+peoplePage()+legacyPage()+finalPage();
 document.querySelectorAll("[data-key]").forEach(el=>{
   const save=()=>{state[el.dataset.key]=el.value;localStorage.setItem(STORAGE,JSON.stringify(state));};
   el.addEventListener("input",save);el.addEventListener("change",save);
 });
}
render();
document.getElementById("print-journal").onclick=()=>window.print();
document.getElementById("clear-journal").onclick=()=>{if(confirm("Clear every saved journal entry in this browser?")){state={};localStorage.removeItem(STORAGE);render();}};
})();