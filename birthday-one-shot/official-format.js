(function(){
  const overview=document.getElementById('overview');
  const rooms=document.getElementById('rooms');
  if(!overview||!rooms||!window.ADVENTURE)return;

  overview.innerHTML=`
    <h2>Adventure Overview</h2>
    <div class="module-meta">
      <p><strong>Adventure:</strong> ${ADVENTURE.title}</p>
      <p><strong>Levels:</strong> 3rd level</p>
      <p><strong>Party:</strong> ${ADVENTURE.party}</p>
      <p><strong>Estimated Time:</strong> ${ADVENTURE.runtime}</p>
    </div>
    <article class="card module-section"><h3>Adventure Background</h3><p>${ADVENTURE.premise}</p><p>For generations, the Wishing Cake Inn has celebrated birthdays beneath an old blessing: a sincere wish made over its candles may briefly take visible form. Sepulchral, the Keeper of Forgotten Wishes, believes hope only prepares people for pain. He steals the Birthday Hero's unspoken wish and carries it into the abandoned celebration halls beneath the inn.</p></article>
    <article class="card module-section"><h3>Adventure Synopsis</h3><p>The characters attend the Birthday Hero's birthday at the Wishing Cake Inn. When her wish is stolen, they pursue it through a linear series of celebration-themed chambers. Along the way they solve two puzzles, survive one trap, fight three encounters, learn Sepulchral's history, and confront him in a three-phase finale. Success returns the wish in time for the Birthday Hero to complete the birthday ceremony.</p></article>
    <article class="card module-section"><h3>Running the Adventure</h3><ul><li><strong>Keep the pace moving.</strong> The route is linear and every failed check should cost time, hit points, position, or resources rather than stopping progress.</li><li><strong>Read boxed text aloud.</strong> Paraphrase freely after the opening description and answer questions using the sensory details in each location.</li><li><strong>Center the Birthday Hero.</strong> The Birthday Hero receives the clearest visions and makes the final choice, but every character must contribute to the rescue.</li><li><strong>Adjust encounters.</strong> For four characters, use the lower creature count. For five or six, add one minor creature or increase a major creature's hit points by roughly 10.</li></ul></article>
    <article class="card module-section"><h3>Adventure Flow</h3><table class="timeline"><thead><tr><th>Time</th><th>Scene</th></tr></thead><tbody>${ADVENTURE.timeline.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></article>
    <article class="card module-section"><h3>Key NPCs</h3><ul>${ADVENTURE.npcs.map(n=>`<li><strong>${n.name}.</strong> ${n.role}. ${n.goal}</li>`).join('')}</ul></article>`;

  const heading=rooms.querySelector('h2');
  if(heading) heading.textContent='The Adventure';
  rooms.querySelectorAll('.room').forEach((room,index)=>{
    room.classList.add('published-location');
    const read=room.querySelector('.readaloud');
    if(read && !read.previousElementSibling?.classList.contains('boxed-label')){
      const label=document.createElement('p');
      label.className='boxed-label';
      label.textContent='Read or paraphrase the following:';
      read.parentNode.insertBefore(label,read);
    }
    const h3=room.querySelector('h3');
    if(h3) h3.dataset.part=`Part ${index+1}`;
  });
})();