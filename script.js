const $ = s => document.querySelector(s);
const fields = ['idea','audience','type','platform','model','goal','vibe','constraint','avoid'];
const key = 'launchpack/ai-promoter/v1';
let activePlaybook = 'campaign';
let currentMarkdown = '';

const examples = {
  idea:'A zero-budget Roblox anime combat game with fast dashes, parries, training rooms, boss encounters, and short mastery challenges.',
  audience:'Roblox players who like anime combat games and want skill-based fights',
  type:'game',
  platform:'TikTok / Shorts',
  model:'Any model / universal',
  goal:'get testers',
  vibe:'bold and viral',
  constraint:'solo dev, free assets only, playable prototype, no paid ads',
  avoid:'fake claims, corporate wording, cringe hype, saying it is finished when it is not'
};

const stackMeta = {
  campaign:{name:'Campaign Architect',deliverables:['positioning statement','10 hooks','3 platform posts','7-day promo calendar','call-to-action ladder','weak point critique']},
  hooks:{name:'Hook Smith',deliverables:['25 hooks sorted by angle','5 title formulas','5 opening lines','strongest 3 ranked with reasons','anti-cringe rewrite pass']},
  critic:{name:'Brutal Critic',deliverables:['scorecard','unclear promise diagnosis','audience mismatch warnings','better positioning','rewritten pitch']},
  repurpose:{name:'Repurpose Engine',deliverables:['TikTok script','YouTube Short script','X thread','Reddit post','Discord announcement','landing page hero']}
};

function clean(s,fallback=''){return (s||'').trim() || fallback}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function sentenceCase(s){return s ? s.charAt(0).toUpperCase()+s.slice(1) : s}
function shortTitle(idea){return clean(idea,'Untitled offer').split(/[.!?\n]/)[0].replace(/^a\s+/i,'').slice(0,92)}
function modelGuidance(model){
  if(model.includes('Local')) return 'Use simple, explicit instructions. Avoid long hidden reasoning. If unsure, ask one clarifying question, then produce the requested output.';
  if(model.includes('Claude')) return 'Be strategic, precise, and critique the positioning before writing final copy.';
  if(model.includes('Gemini')) return 'Generate multiple diverse angles and keep outputs practical, concise, and platform-aware.';
  if(model.includes('Grok')) return 'Use sharper cultural instincts, but avoid edgy claims that could misrepresent the offer.';
  if(model.includes('ChatGPT')) return 'Use structured sections, strong copywriting, and clear step-by-step campaign assets.';
  return 'Assume a capable general model. Be explicit about role, context, output format, constraints, and evaluation criteria.';
}
function platformRules(platform){
  const rules={
    'TikTok / Shorts':['Open with visual proof in the first 2 seconds','Write like a spoken script, not an essay','Include shot ideas and on-screen text'],
    'YouTube':['Create clickable titles without lying','Include retention beats and a clear viewer payoff','Suggest thumbnail text'],
    'X / Twitter':['Lead with a compact claim or story','Use short lines and one strong CTA','Create one post and one thread version'],
    'Reddit':['Sound human, useful, and non-spammy','Disclose what is unfinished','Ask for specific feedback'],
    'Discord':['Make it community-first','Use short announcement format','Include what people can try today'],
    'Instagram':['Prioritize visual caption hooks','Suggest carousel/reel framing','Keep CTA simple'],
    'Landing page':['Write headline, subheadline, proof, benefits, CTA','Reduce vague adjectives','Make the promise obvious above the fold'],
    'All platforms':['Generate one adapted asset for each major platform','Explain why each version changes','Keep claims consistent']
  };
  return rules[platform] || rules['All platforms'];
}
function playbookInstruction(playbook){
  const map={
    campaign:'Build a complete lightweight campaign that can be executed this week.',
    hooks:'Focus on a large set of scroll-stopping hooks. Rank them and explain why the top 3 work.',
    critic:'First critique the current positioning honestly, then rewrite it into something people understand and care about.',
    repurpose:'Turn one core message into native content for several platforms without sounding copy-pasted.'
  };
  return map[playbook];
}
function angleSet(type,goal){
  const base=['curiosity','pain point','transformation','proof','challenge','behind-the-scenes'];
  if(type==='game') base.push('skill mastery','boss reveal','player challenge');
  if(type==='music/song') base.push('emotion','story behind the song','before/after mix');
  if(goal.includes('testers')) base.push('early access','feedback request');
  if(goal.includes('sell')) base.push('value stack','risk reversal');
  return [...new Set(base)].slice(0,9);
}
function scorePrompt(data){
  let score=42;
  if(data.idea.length>45) score+=13;
  if(data.audience.length>28) score+=13;
  if(data.constraint.length>20) score+=10;
  if(data.avoid.length>12) score+=7;
  if(!data.platform.includes('All')) score+=6;
  if(data.goal) score+=5;
  if(data.vibe) score+=4;
  return Math.max(18,Math.min(98,score));
}
function masterPrompt(data,title,meta,angles){
  return `You are an elite AI promotion strategist and direct-response creative director. Your job is to help me promote the following offer without exaggerating, lying, or sounding generic.\n\nOFFER / PROJECT\n${data.idea}\n\nTARGET AUDIENCE\n${data.audience}\n\nOFFER TYPE\n${data.type}\n\nPRIMARY PLATFORM\n${data.platform}\n\nPROMOTION GOAL\n${data.goal}\n\nVOICE / VIBE\n${data.vibe}\n\nREAL CONSTRAINTS OR PROOF\n${data.constraint}\n\nAVOID\n${data.avoid}\n\nMODEL-SPECIFIC INSTRUCTION\n${modelGuidance(data.model)}\n\nTASK MODE\n${meta.name}: ${playbookInstruction(activePlaybook)}\n\nPROMOTION ANGLES TO EXPLORE\n${angles.map(a=>'- '+a).join('\n')}\n\nPLATFORM RULES\n${platformRules(data.platform).map(r=>'- '+r).join('\n')}\n\nDELIVERABLES\n${meta.deliverables.map(x=>'- '+sentenceCase(x)).join('\n')}\n\nQUALITY BAR\n- Make the value obvious to someone who has never heard of this.\n- Prefer concrete hooks over vague hype.\n- Separate honest claims from assumptions.\n- Include at least one low-effort version I can post today.\n- Include a stronger version if I can spend 30-60 minutes making proof assets.\n- Give me copy I can paste directly, but also explain the strategy briefly.\n\nOUTPUT FORMAT\n1. One-sentence positioning\n2. Audience pain/desire insight\n3. Best promotion angle\n4. ${meta.deliverables.join('\n5. ')}\n6. What to test next\n7. Final copy-ready post\n\nBefore finalizing, do a quick self-critique: is it specific, believable, platform-native, and easy to act on? Then improve it once.`;
}
function quickPrompts(data,title){
  return [
    `Rewrite this into 10 stronger hooks for ${data.platform}: ${title}. Audience: ${data.audience}. Vibe: ${data.vibe}. Avoid: ${data.avoid}.`,
    `Act as a skeptical user. Tell me why this promotion is unclear or unconvincing, then rewrite it: ${data.idea}`,
    `Create a 7-day no-budget promotion plan for ${data.type}: ${title}. Goal: ${data.goal}. Constraint: ${data.constraint}.`,
    `Turn this into platform-native copy for TikTok, YouTube Shorts, X, Reddit, Discord, and a landing page hero: ${data.idea}`
  ];
}
function setScore(score){
  $('#scoreValue').textContent=score;
  $('#scoreRing').style.background=`conic-gradient(var(--green) ${score*3.6}deg,var(--line) 0deg)`;
  $('#scoreText').textContent=score>82?'Strong prompt. It gives the model role, audience, proof, platform, constraints, and output format.':score>62?'Good prompt. Add sharper proof, audience detail, or avoid-list to make the AI less generic.':'Too vague. Add audience, platform, proof, and what the model should avoid.';
}
function generate(){
  const data=Object.fromEntries(fields.map(id=>[id,clean($('#'+id).value, id==='audience'?'people most likely to care':id==='avoid'?'fake claims, vague hype, overpromising':'') ]));
  if(!data.idea){return null}
  const title=shortTitle(data.idea);
  const meta=stackMeta[activePlaybook];
  const angles=angleSet(data.type,data.goal);
  const score=scorePrompt(data);
  const prompt=masterPrompt(data,title,meta,angles);
  const promptlets=quickPrompts(data,title);
  const platformList=platformRules(data.platform);
  currentMarkdown=`# LaunchPack AI Promoter Kit: ${title}\n\n## Prompt strength\n${score}/100\n\n## Use this in any AI model\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n## Fast follow-up prompts\n${promptlets.map(p=>'- '+p).join('\n')}\n\n## Platform rules\n${platformList.map(r=>'- '+r).join('\n')}\n\n## Promotion angles\n${angles.map(a=>'- '+a).join('\n')}\n`;
  $('#pack').innerHTML=`<div class="pack-head"><div><span class="pill">${escapeHtml(data.model)} • ${escapeHtml(data.platform)}</span><h3>${escapeHtml(title)}</h3></div><span class="pill">${escapeHtml(meta.name)}</span></div>
  <section class="pack-section"><h4>What this does</h4><p>Creates a complete model-ready prompt so any AI can act as your promoter, critic, hook writer, and campaign planner without needing an API connection.</p></section>
  <section class="pack-section"><h4>Universal master prompt</h4><pre class="prompt-box">${escapeHtml(prompt)}</pre></section>
  <section class="pack-section"><h4>Fast follow-up prompts</h4><ol>${promptlets.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section>
  <section class="pack-section"><h4>Promotion angles</h4><ul>${angles.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>
  <section class="pack-section"><h4>Platform guardrails</h4><ul>${platformList.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`;
  localStorage.setItem(key,JSON.stringify({...data,activePlaybook}));
  setScore(score);
  return currentMarkdown;
}
function loadDemo(){for(const [k,v] of Object.entries(examples)) $('#'+k).value=v; activePlaybook='campaign'; setActive(); generate(); location.hash='builder'}
function setActive(){document.querySelectorAll('.playbook').forEach(b=>b.classList.toggle('active',b.dataset.playbook===activePlaybook))}
async function copyPack(){if(!currentMarkdown) generate(); await navigator.clipboard?.writeText(currentMarkdown); $('#copyBtn').textContent='Copied ✓'; setTimeout(()=>$('#copyBtn').textContent='Copy AI Promoter Prompt',1300)}
function downloadPack(){if(!currentMarkdown) generate(); const blob=new Blob([currentMarkdown],{type:'text/markdown'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='ai-promoter-launchpack.md'; a.click(); URL.revokeObjectURL(url)}
function reset(){localStorage.removeItem(key); fields.forEach(id=>$('#'+id).value=''); currentMarkdown=''; $('#pack').innerHTML='<div class="empty"><strong>Your AI Promoter Kit appears here.</strong><p>It will include a universal master prompt, platform prompt, critique prompt, output format, and copy-ready campaign angles.</p></div>'; setScore(0)}
function restore(){try{const d=JSON.parse(localStorage.getItem(key)||'null'); if(!d)return; fields.forEach(id=>{if(d[id]) $('#'+id).value=d[id]}); activePlaybook=d.activePlaybook||'campaign'; setActive(); generate()}catch{}}
$('#launchForm').addEventListener('submit',e=>{e.preventDefault(); generate()});
$('#demoBtn').addEventListener('click',loadDemo);
$('#copyBtn').addEventListener('click',copyPack);
$('#downloadBtn').addEventListener('click',downloadPack);
$('#clearBtn').addEventListener('click',reset);
document.querySelectorAll('.playbook').forEach(b=>b.addEventListener('click',()=>{activePlaybook=b.dataset.playbook; setActive(); generate()}));
restore();
