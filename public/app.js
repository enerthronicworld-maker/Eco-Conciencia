const API = '' ; // si el backend corre en el mismo host, dejar en blanco

// helpers de localStorage
function saveToken(t){ localStorage.setItem('eco_token', t); }
function getToken(){ return localStorage.getItem('eco_token'); }

// Autenticación (login / register)
if(document.getElementById('btnRegister')){
  document.getElementById('btnRegister').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(API + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) });
    const j = await res.json();
    document.getElementById('authMsg').innerText = j.error || 'Registrado con éxito';
  };
  document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(API + '/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if(j.token){ saveToken(j.token); document.getElementById('authMsg').innerText = 'Ingreso correcto'; }
    else document.getElementById('authMsg').innerText = j.error || 'Error';
  };
}

// Calculadora
if(document.getElementById('calcForm')){
  document.getElementById('calcForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      transporte: { tipo: document.getElementById('transTipo').value, kmSemana: Number(document.getElementById('kmSemana').value) },
      energiaKwhMes: Number(document.getElementById('energiaKwhMes').value),
      alimentacion: document.getElementById('alimentacion').value
    };
    const token = getToken();
    const res = await fetch(API + '/api/calculadora', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(data) });
    const j = await res.json();
    document.getElementById('resultado').innerText = j.kgCO2_anual ? `Tu huella estimada: ${Math.round(j.kgCO2_anual)} kg CO2/año. Recomendaciones: ${j.recomendaciones.join(', ')}` : (j.error || 'Error');
  });
}

// Quiz simple en games.html
if(document.getElementById('quiz')){
  const preguntas = [
    { q: '¿Cuál es una buena forma de reducir emisiones?', a: ['Usar auto solo','Caminar','Tirar reciclables'], ans: 1 },
    { q: '¿Qué contamina menos?', a: ['Carne roja frecuente','Dieta basada en vegetales','Comida procesada'], ans: 1 }
  ];
  let puntaje = 0;
  const cont = document.getElementById('quiz');
  preguntas.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'mb-3 p-2 border rounded';
    div.innerHTML = `<p><strong>${i+1}. ${p.q}</strong></p>`;
    p.a.forEach((op, oi) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline-success btn-sm me-2';
      btn.innerText = op;
      btn.onclick = () => { if(oi === p.ans) puntaje += 10; btn.disabled = true; };
      div.appendChild(btn);
    });
    cont.appendChild(div);
  });
  const terminar = document.createElement('button');
  terminar.className = 'btn btn-success';
  terminar.innerText = 'Terminar y guardar puntaje';
  terminar.onclick = async () => {
    const token = getToken();
    const res = await fetch(API + '/api/games/score', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ score: puntaje, detalle: { preguntas: preguntas.length } }) });
    const j = await res.json();
    document.getElementById('quizResult').innerText = `Puntaje: ${puntaje}. ${j.ok ? 'Guardado' : (j.error || '')}`;
  };
  cont.appendChild(terminar);
}
