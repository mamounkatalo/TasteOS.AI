// Smooth scroll to health section
const btnHealth = document.getElementById('btnHealth');
const btnHealth2 = document.getElementById('btnHealth2');
const btnGoHealth = document.getElementById('btnGoHealth');
function goHealth(){ const el=document.getElementById('health'); el && el.scrollIntoView({behavior:'smooth', block:'start'}); }
[btnHealth, btnHealth2, btnGoHealth].forEach(b=> b && b.addEventListener('click', goHealth));

// Ingredients handling
const chips = document.getElementById('chips');
const input = document.getElementById('ingInput');
document.getElementById('btnAdd').onclick = () => { const v = input.value.trim(); if(!v) return; addPill(v); input.value=''; };
document.getElementById('btnScan').onclick = () => ['chicken','quinoa','lentils','tomato','spinach','olive oil','chili'].forEach(addPill);
document.getElementById('btnClear').onclick = () => chips.innerHTML='';
function addPill(text){
  const s = document.createElement('span');
  s.className='pill';
  s.textContent=text.toLowerCase();
  s.title='Hold to remove';
  let timer;
  s.onmousedown = () => timer = setTimeout(()=> s.remove(), 600);
  s.onmouseup = () => clearTimeout(timer);
  chips.appendChild(s);
}
function getIngredients(){ return [...chips.querySelectorAll('.pill')].map(p=>p.textContent); }

// Taste sliders
const t = {
  sweet: document.getElementById('s_sweet'),
  sour: document.getElementById('s_sour'),
  salty: document.getElementById('s_salty'),
  bitter: document.getElementById('s_bitter'),
  spicy: document.getElementById('s_spicy'),
  umami: document.getElementById('s_umami'),
};

// Default weights (grams) and measures
const baseWeights = {
  'tomato': 150,
  'spinach': 60,
  'broccoli': 120,
  'quinoa': 80,        // dry
  'lentils': 100,      // dry
  'rice': 80,          // dry
  'brown rice': 80,    // dry
  'chicken': 200,      // breast
  'salmon': 200,
  'mackerel': 180,
  'egg': 60,
  'olive oil': 15,     // 1 tbsp
  'butter': 10,        // 2 tsp
  'garlic': 8,         // 2 cloves
  'onion': 100,
  'chili': 2,          // chili flakes baseline (tsp ~ 2g)
  'salt': 2,           // tsp ~ 6g but we limit for health
  'lemon': 50
};

// Simple macros per 100g (very rough for demo only)
const macros = {
  'tomato': {kcal:18, p:0.9, c:3.9, f:0.2},
  'spinach': {kcal:23, p:2.9, c:3.6, f:0.4},
  'broccoli': {kcal:34, p:2.8, c:6.6, f:0.4},
  'quinoa': {kcal:120, p:4.4, c:21.3, f:1.9},
  'lentils': {kcal:116, p:9.0, c:20, f:0.4},
  'rice': {kcal:130, p:2.7, c:28, f:0.3},
  'brown rice': {kcal:111, p:2.6, c:23, f:0.9},
  'chicken': {kcal:165, p:31, c:0, f:3.6},
  'salmon': {kcal:208, p:20, c:0, f:13},
  'mackerel': {kcal:205, p:19, c:0, f:13.9},
  'egg': {kcal:155, p:13, c:1.1, f:11},
  'olive oil': {kcal:884, p:0, c:0, f:100},
  'butter': {kcal:717, p:0.9, c:0.1, f:81},
  'garlic': {kcal:149, p:6.4, c:33, f:0.5},
  'onion': {kcal:40, p:1.1, c:9.3, f:0.1},
  'chili': {kcal:318, p:12, c:57, f:17},
  'salt': {kcal:0, p:0, c:0, f:0},
  'lemon': {kcal:29, p:1.1, c:9.3, f:0.3}
};

// Health tips
const tips = {
  'diabetes':[ 'Focus on whole grains & fiber.','Use stevia if sweetening.','Avoid sugary drinks.' ],
  'heart':[ 'Reduce sodium; avoid extra salt.','Prefer grilling/baking; use herbs.' ],
  'cancer':[ 'Ensure adequate protein; add leafy greens & carrots.','Avoid processed meats & sodas.' ],
  'cholesterol':[ 'Increase soluble fiber (oats/legumes).','Use olive oil; avoid trans fats.' ],
  '': [ 'No medical filter active. Choose any dish freely.' ]
};
const sel = document.getElementById('healthSelect');
const tipsBox = document.getElementById('healthTips');
function renderTips(){
  const arr = tips[sel.value || ''];
  tipsBox.innerHTML = arr.map(t=> `<div class="card" style="padding:10px">${t}</div>`).join('');
}
sel.addEventListener('change', renderTips);
renderTips();

// Translate grams to nice units
function formatQty(name, grams){
  if(name==='olive oil') return `${Math.round(grams)} g (~${(grams/15).toFixed(1)} tbsp)`;
  if(name==='butter') return `${Math.round(grams)} g`;
  if(name==='chili') return `${Math.max(0.5, (grams/2)).toFixed(1)} tsp (${Math.round(grams)} g)`;
  if(name==='salt') return `${Math.max(0.3, (grams/6)).toFixed(1)} tsp (${Math.round(grams)} g)`;
  if(name==='garlic') return `${Math.round(grams)} g (~${Math.round(grams/4)} cloves)`;
  if(name==='lemon') return `${Math.round(grams)} g juice (~${Math.round(grams/15)} tsp)`;
  return `${Math.round(grams)} g`;
}

// Dynamic quantity adjustment based on taste sliders and health
function adjustQuantities(ingList, cond){
  // base quantities
  const qty = {};
  ingList.forEach(n => { if(baseWeights[n]) qty[n] = baseWeights[n]; });

  // Ensure core aromatics if present in pantry
  if(ingList.includes('tomato') && !qty['garlic']) qty['garlic'] = baseWeights['garlic'];
  if((ingList.includes('chicken') || ingList.includes('salmon')) && !qty['lemon']) qty['lemon']=baseWeights['lemon'];
  if(!qty['olive oil']) qty['olive oil'] = baseWeights['olive oil'];

  // Taste-driven adjustments
  const spicy = parseFloat(t.spicy.value);
  const salty = parseFloat(t.salty.value);
  const sour  = parseFloat(t.sour.value);
  const umami = parseFloat(t.umami.value);

  // Chili scales 0g → 6g (baseline 2g)
  qty['chili'] = Math.max(0, (2 + (spicy-0.5)*8)); // 0 to ~6g
  // Salt scales 0.5g → 4g (with heart condition cap)
  let saltTarget = Math.max(0.5, (2 + (salty-0.5)*6));
  if(cond==='heart') saltTarget = Math.min(saltTarget, 2); // cap for heart patients
  qty['salt'] = saltTarget;
  // Lemon juice increases with sour
  qty['lemon'] = (qty['lemon']||0) + Math.max(0, (sour-0.5)*30); // ±15g

  // Umami: increase protein slightly
  if(ingList.includes('chicken')) qty['chicken'] = (qty['chicken']||0) + Math.max(0, (umami-0.5)*60);
  if(ingList.includes('salmon')) qty['salmon'] = (qty['salmon']||0) + Math.max(0, (umami-0.5)*40);

  // Health safeguards
  if(cond==='diabetes'){
    // discourage white rice; prefer quinoa/lentils
    if(ingList.includes('rice') && !ingList.includes('brown rice')) {
      // keep rice small portion
      qty['rice'] = Math.min(qty['rice']||80, 60);
    }
  }
  if(cond==='cholesterol'){
    // limit butter
    if(qty['butter']) qty['butter'] = Math.min(qty['butter'], 6);
  }

  return qty;
}

// Nutrition calc
function calcNutrition(qty){
  const tot = {kcal:0,p:0,c:0,f:0};
  Object.entries(qty).forEach(([name, g])=>{
    const m = macros[name];
    if(!m) return;
    const factor = g/100;
    tot.kcal += m.kcal*factor; tot.p += m.p*factor; tot.c += m.c*factor; tot.f += m.f*factor;
  });
  Object.keys(tot).forEach(k=> tot[k] = Math.round(tot[k]));
  return tot;
}

// Health analysis
function analyzeHealth(ing, cond){
  ing = ing.map(x=>x.toLowerCase());
  const warn = [];
  const ok = [];
  if(cond==='diabetes'){
    if(ing.includes('rice') && !ing.includes('brown rice')) warn.push('Prefer brown rice/quinoa over white rice');
    ok.push('High-fiber choices recommended (lentils, quinoa, veggies)');
  }
  if(cond==='heart'){
    warn.push('Watch sodium; avoid extra salt/soy sauce');
    ok.push('Prefer grilling/baking; use herbs & citrus');
  }
  if(cond==='cancer'){
    warn.push('Avoid processed meats & sugary sodas');
    ok.push('Prioritize protein + leafy greens & carrots');
  }
  if(cond==='cholesterol'){
    warn.push('Avoid trans fats & excess butter; use olive oil');
    ok.push('Add soluble fiber (oats/legumes) & fish');
  }
  return {warn, ok};
}

// Recipe templates
function buildRecipeTitle(ing){
  if(ing.includes('quinoa') || ing.includes('lentils')) return 'Quinoa & Lentil Power Bowl';
  if(ing.includes('salmon')) return 'Grilled Salmon with Greens';
  if(ing.includes('chicken')) return 'Herbed Chicken Veggie Bowl';
  if(ing.includes('pasta') && (ing.includes('tomato')||ing.includes('garlic'))) return 'Tomato Garlic Pasta';
  return 'Hearty Veggie Sauté';
}

function buildSteps(qty, cond){
  const steps = [];
  if(qty['quinoa']) steps.push(`Rinse quinoa, then cook ${Math.round(qty['quinoa'])} g in double water until fluffy.`);
  if(qty['lentils']) steps.push(`Boil lentils ${Math.round(qty['lentils'])} g for 20–25 min until tender.`);
  if(qty['rice']) steps.push(`Cook rice ${Math.round(qty['rice'])} g (prefer brown rice for diabetes).`);
  if(qty['chicken']) steps.push(`Season chicken ${Math.round(qty['chicken'])} g with garlic and herbs; grill or pan-sear 6–8 min/side.`);
  if(qty['salmon']) steps.push(`Season salmon ${Math.round(qty['salmon'])} g; grill/pan-sear 3–4 min/side.`);
  if(qty['tomato']) steps.push(`Chop tomatoes ${Math.round(qty['tomato'])} g and spinach ${Math.round(qty['spinach']||0)} g.`);
  if(qty['olive oil']) steps.push(`Warm olive oil ${formatQty('olive oil', qty['olive oil'])} in pan; sauté aromatics.`);
  if(qty['garlic']) steps.push(`Add garlic ${formatQty('garlic', qty['garlic'])} (do not burn).`);
  if(qty['chili']) steps.push(`Add chili ${formatQty('chili', qty['chili'])} based on heat preference.`);
  if(qty['lemon']) steps.push(`Finish with lemon juice ${formatQty('lemon', qty['lemon'])}.`);
  steps.push('Taste and adjust seasoning (salt/herbs).');
  if(cond==='heart') steps.push('For heart/hypertension: keep salt minimal and use herbs for flavor.');
  if(cond==='diabetes') steps.push('For diabetes: balance carbs with fiber/protein and avoid added sugar.');
  return steps;
}

// Render recipe
function renderRecipe(title, qty, tot, cond){
  const out = document.getElementById('output');
  const list = Object.entries(qty).filter(([n,g])=>g>0).map(([n,g])=>`<li>${n}: <b>${formatQty(n,g)}</b></li>`).join('');
  const health = analyzeHealth(Object.keys(qty), cond);
  const ok = health.ok.map(t=> `<span class="badge ok">✅ ${t}</span>`).join(' ');
  const warn = health.warn.map(t=> `<span class="badge warn">⚠️ ${t}</span>`).join(' ');
  const steps = buildSteps(qty, cond).map(s=>`<li>${s}</li>`).join('');
  out.innerHTML = `
    <h3>${title}</h3>
    <div class="tags">
      <span class="badge">Condition: ${cond||'None'}</span>
      <span class="badge">Est. kcal: ${tot.kcal}</span>
      <span class="badge">P:${tot.p}g C:${tot.c}g F:${tot.f}g</span>
    </div>
    <b>Ingredients</b>:
    <ul class="ing">${list}</ul>
    <b>Steps</b>:
    <ol class="steps">${steps}</ol>
    <div class="tags">${ok} ${warn}</div>
    <div class="small">*Nutrition is a rough estimate for demo purposes only.</div>
  `;
}

// Handlers
document.getElementById('btnCook').onclick = () => {
  const ing = getIngredients();
  // If no ingredients, provide a handy default set
  const base = ing.length? ing : ['quinoa','lentils','tomato','spinach','olive oil','garlic','chili'];
  const cond = sel.value;
  const qty = adjustQuantities(base, cond);
  const tot = calcNutrition(qty);
  const title = buildRecipeTitle(base);
  renderRecipe(title, qty, tot, cond);
  if(cond) goHealth();
};

document.getElementById('btnRescue').onclick = () => {
  const cond = sel.value;
  const box = document.getElementById('output');
  const extra = cond==='diabetes' ? 'Use stevia if sweetening.' :
                cond==='heart' ? 'Avoid extra salt; add herbs/citrus.' :
                cond==='cancer' ? 'Increase protein; avoid processed meats.' :
                cond==='cholesterol' ? 'Use olive oil; avoid trans fats.' : '—';
  box.innerHTML = `<b>Rescue Tips:</b> Dilute, balance with acid/dairy, remove burnt bits. <i>${extra}</i>`;
  goHealth();
};

document.getElementById('btnLeftovers').onclick = () => {
  const examples = [
    {left:'day-old rice + veggies', ideas:['Fried rice with egg','Stuffed bell peppers','Rice & bean bowl']},
    {left:'grilled chicken', ideas:['Chicken wrap with yogurt sauce','Chicken quinoa salad','Chicken & veggie soup']},
    {left:'roasted vegetables', ideas:['Veggie frittata','Pasta primavera','Warm grain salad']}
  ];
  const pick = examples[Math.floor(Math.random()*examples.length)];
  document.getElementById('output').innerHTML = `<b>Leftovers → New Dish</b><br>
    <i>Input:</i> ${pick.left}<br><i>Ideas:</i> ${pick.ideas.join(' • ')}`;
};
