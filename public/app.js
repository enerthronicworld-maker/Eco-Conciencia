const API = ''; // si el backend corre en el mismo host, dejar en blanco

// ------------------- HELPERS -------------------
function saveToken(t){ localStorage.setItem('eco_token', t); }
function getToken(){ return localStorage.getItem('eco_token'); }

// ------------------- AUTENTICACIÓN -------------------
if(document.getElementById('btnRegister')){
  document.getElementById('btnRegister').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(API + '/api/auth/register', { 
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ name, email, password }) 
    });
    const j = await res.json();
    document.getElementById('authMsg').innerText = j.error || 'Registrado con éxito';
  };
  document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(API + '/api/auth/login', { 
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ email, password }) 
    });
    const j = await res.json();
    if(j.token){ 
      saveToken(j.token); 
      localStorage.setItem("eco_usuario", j.name || email); // guardar usuario para ranking
      document.getElementById('authMsg').innerText = 'Ingreso correcto'; 
    }
    else document.getElementById('authMsg').innerText = j.error || 'Error';
  };
}

// ------------------- FUNCION PARA GUARDAR SCORE -------------------
async function guardarScore(juego, score, detalle){
  const display = document.getElementById(juego+'Result');
  if(display) display.innerText = `Puntaje en ${juego}: ${score}`;
  
  const token = getToken();
  if(token){
    const res = await fetch(API + '/api/games/score', { 
      method: 'POST', 
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify({ juego, score, detalle }) 
    });
    const j = await res.json();
    if(display) display.innerText += j.ok ? ' (Guardado)' : ` (${j.error || ''})`;
  }

  // guardar también en localStorage para el ranking
  let usuario = localStorage.getItem("eco_usuario") || "Invitado";
  let data = JSON.parse(localStorage.getItem(usuario)) || {};
  data[juego] = score; // actualizar puntaje parcial
  localStorage.setItem(usuario, JSON.stringify(data));
}

// ------------------- JUEGO: QUIZ -------------------
if(document.getElementById('quiz')){
  const preguntas = [
    { q: '¿Cuál es una buena forma de reducir emisiones?', a: ['Usar auto solo','Caminar','Tirar reciclables'], ans: 1 },
    { q: '¿Qué contamina menos?', a: ['Carne roja frecuente','Dieta basada en vegetales','Comida procesada'], ans: 1 },
    { q: '¿Qué recurso es más importante ahorrar en casa?', a: ['Electricidad','Agua','Internet'], ans: 1 },
    { q: '¿Qué es mejor para el planeta?', a: ['Plástico de un solo uso','Botella reutilizable','Vasos descartables'], ans: 1 },
    { q: '¿Cuál energía es renovable?', a: ['Carbón','Solar','Petróleo'], ans: 1 }
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
      btn.onclick = () => { 
        if(oi === p.ans){
          puntaje += 10;
          btn.classList.add('btn-success');
        } else btn.classList.add('btn-danger');
        Array.from(div.querySelectorAll('button')).forEach(b=>b.disabled=true);
      };
      div.appendChild(btn);
    });
    cont.appendChild(div);
  });
  const terminar = document.createElement('button');
  terminar.className = 'btn btn-success mt-2';
  terminar.innerText = 'Terminar y guardar puntaje';
  terminar.onclick = ()=>guardarScore('quiz', puntaje, { preguntas: preguntas.length });
  cont.appendChild(terminar);
}

// ------------------- JUEGO: MEMORIA -------------------
if(document.getElementById('memoria')){
  const cartas = ['🌳','🌎','🚲','💧','♻️','☀️','🌳','🌎','🚲','💧','♻️','☀️'];
  let primera = null, bloqueo = false, aciertos = 0, intentos = 0;
  cartas.sort(() => 0.5 - Math.random());

  const cont = document.getElementById('memoria');
  const cartasCont = document.createElement('div');
  cartasCont.style.display = 'flex';
  cartasCont.style.flexWrap = 'wrap';
  cartasCont.style.justifyContent = 'center';
  cartasCont.style.gap = '0.5rem';
  cont.appendChild(cartasCont);

  const info = document.createElement('p'); 
  info.innerText = 'Intentos: 0'; 
  cont.appendChild(info);

  cartas.forEach((c,i)=>{
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary m-1';
    btn.style.width = '60px'; btn.style.height='60px';
    btn.innerText = '?';
    btn.onclick = ()=>{
      if(bloqueo || btn.disabled) return;
      btn.innerText = c;
      if(!primera){ primera = {btn,c}; }
      else {
        intentos++;
        info.innerText = `Intentos: ${intentos}`;
        if(primera.c === c){
          btn.disabled = true; primera.btn.disabled = true;
          aciertos++;
          primera=null;
        } else {
          bloqueo = true;
          setTimeout(()=>{ btn.innerText='?'; primera.btn.innerText='?'; primera=null; bloqueo=false; },1000);
        }
      }
    };
    cartasCont.appendChild(btn);
  });

  const terminar = document.createElement('button');
  terminar.className='btn btn-success mt-2';
  terminar.innerText='Terminar y guardar puntaje';
  terminar.onclick = ()=>{
    const score = Math.max(100 - intentos*5, 10);
    guardarScore('memoria', score, {intentos});
  };
  cont.appendChild(terminar);
}

// ------------------- JUEGO: ARRASTRA Y SUELTA -------------------
if(document.getElementById('draggame')){
  const items = [
    'Botella de plástico','Cáscara de plátano','Papel usado',
    'Lata de aluminio','Restos de comida','Vidrio',
    'Bolsas plásticas','Cartón','Botella de vidrio'
  ];

  const categorias = ['Orgánico','Reciclable','Otros'];

  const correctas = { 
    'Botella de plástico':'Reciclable', 
    'Cáscara de plátano':'Orgánico', 
    'Papel usado':'Reciclable',
    'Lata de aluminio':'Reciclable',
    'Restos de comida':'Orgánico',
    'Vidrio':'Reciclable',
    'Bolsas plásticas':'Reciclable',
    'Cartón':'Reciclable',
    'Botella de vidrio':'Reciclable'
  };

  let puntaje = 0;

  const cont = document.getElementById('draggame');
  const itemBox = document.createElement('div'); 
  itemBox.className='d-flex flex-wrap mb-2 gap-2';
  cont.appendChild(itemBox);

  const info = document.createElement('p'); info.innerText='Puntaje: 0'; cont.appendChild(info);

  items.forEach(it=>{
    const d = document.createElement('div');
    d.innerText = it; 
    d.className='p-2 m-1 border bg-light';
    d.draggable=true;
    d.ondragstart = e => e.dataTransfer.setData('text', it);
    itemBox.appendChild(d);
  });

  categorias.forEach(cat=>{
    const zone = document.createElement('div');
    zone.className='p-3 m-1 border border-success rounded';
    zone.innerText=cat;
    zone.ondragover = e=>e.preventDefault();
    zone.ondrop = e=>{
      const it = e.dataTransfer.getData('text');
      const elem = Array.from(itemBox.children).find(el=>el.innerText===it);
      if(elem){
        if(correctas[it]===cat){ 
          puntaje+=10; 
          info.innerText=`Puntaje: ${puntaje}`; 
          elem.style.opacity=0.5; 
          elem.draggable=false; 
        }
      }
    };
    cont.appendChild(zone);
  });

  const terminar = document.createElement('button');
  terminar.className='btn btn-success mt-2';
  terminar.innerText='Terminar y guardar puntaje';
  terminar.onclick = ()=>guardarScore('arrastrar', puntaje, {});
  cont.appendChild(terminar);
}

// ------------------- JUEGO: SOPA DE LETRAS -------------------
if(document.getElementById('sopa')){
  const palabras = ['AGUA','SOL','AIRE','RECICLA'];
  const gridSize = 10;
  const cont = document.getElementById('sopa');

  const lista = document.createElement('p');
  lista.innerHTML = 'Palabras a buscar: <strong>' + palabras.join(', ') + '</strong>';
  cont.appendChild(lista);

  const tabla = document.createElement('table'); 
  tabla.className='table table-bordered text-center';
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grid = Array.from({length:gridSize}, ()=>Array(gridSize).fill(''));
  const posiciones = [];
  const direcciones = [{dx:1,dy:0},{dx:0,dy:1},{dx:1,dy:1}];

  palabras.forEach(p=>{
    let colocado=false;
    while(!colocado){
      const dir = direcciones[Math.floor(Math.random()*direcciones.length)];
      const fila = Math.floor(Math.random()*gridSize);
      const col = Math.floor(Math.random()*gridSize);
      let cabe=true;
      for(let i=0;i<p.length;i++){
        const x = fila + i*dir.dy;
        const y = col + i*dir.dx;
        if(x>=gridSize||y>=gridSize||(grid[x][y]!=='' && grid[x][y]!==p[i])) cabe=false;
      }
      if(cabe){
        for(let i=0;i<p.length;i++){
          const x = fila + i*dir.dy;
          const y = col + i*dir.dx;
          grid[x][y]=p[i];
          posiciones.push({fila:x,col:y,letra:p[i],palabra:p});
        }
        colocado=true;
      }
    }
  });

  for(let i=0;i<gridSize;i++)
    for(let j=0;j<gridSize;j++)
      if(grid[i][j]==='') grid[i][j]=letras[Math.floor(Math.random()*letras.length)];

  let encontrados = [];
  for(let i=0;i<gridSize;i++){
    const tr = document.createElement('tr');
    for(let j=0;j<gridSize;j++){
      const td = document.createElement('td'); td.className='p-2';
      td.innerText = grid[i][j];
      td.style.cursor='pointer';
      td.onclick = ()=>{
        if(td.style.background==='yellow'){ 
          td.style.background=''; 
          encontrados = encontrados.filter(e=>!(e.f===i&&e.c===j)); 
          return; 
        }
        td.style.background='yellow';
        encontrados.push({f:i,c:j,letra:td.innerText});
      };
      tr.appendChild(td);
    }
    tabla.appendChild(tr);
  }
  cont.appendChild(tabla);

  const terminar = document.createElement('button');
  terminar.className='btn btn-success mt-2';
  terminar.innerText='Terminar y guardar puntaje';
  terminar.onclick = ()=>{
    let score = palabras.reduce((acc,p)=>{
      const pos = posiciones.filter(e=>e.palabra===p);
      const encontrada = pos.every(e=>encontrados.some(f=>f.f===e.f && f.c===e.col));
      return acc + (encontrada?25:0);
    },0);
    guardarScore('sopa', score, {palabras});
  };
  cont.appendChild(terminar);
}

// ------------------- RANKING -------------------
if(document.getElementById("ranking")){
  const tbody = document.querySelector("#ranking tbody");
  const selectTop = document.querySelector("#selectTop");
  const selectFiltro = document.querySelector("#selectFiltro");
  const btnActualizar = document.querySelector("#btnActualizar");

  function obtenerUsuarios() {
    let usuarios = [];
    Object.keys(localStorage).forEach((key) => {
      try {
        let datos = JSON.parse(localStorage.getItem(key));
        if (datos && typeof datos === "object" && (datos.quiz || datos.memoria || datos.sopa || datos.arrastrar)) {
          usuarios.push({
            usuario: key,
            quiz: datos.quiz || 0,
            memoria: datos.memoria || 0,
            sopa: datos.sopa || 0,
            arrastrar: datos.arrastrar || 0,
            total:
              (datos.quiz || 0) +
              (datos.memoria || 0) +
              (datos.sopa || 0) +
              (datos.arrastrar || 0),
          });
        }
      } catch (e) {}
    });
    return usuarios;
  }

  function renderRanking() {
    let usuarios = obtenerUsuarios();
    usuarios.sort((a, b) => b.total - a.total);

    let limite = parseInt(selectTop.value);
    if (limite > 0 && usuarios.length > limite) {
      usuarios = usuarios.slice(0, limite);
    }

    let filtro = selectFiltro.value;
    if (filtro !== "Todos") {
      usuarios = usuarios.filter((u) => u.usuario === filtro);
    }

    tbody.innerHTML = "";
    usuarios.forEach((u, index) => {
      let fila = `
        <tr>
          <td>${index + 1}</td>
          <td>${u.usuario}</td>
          <td>${u.quiz}</td>
          <td>${u.memoria}</td>
          <td>${u.sopa}</td>
          <td>${u.arrastrar}</td>
          <td><strong>${u.total}</strong></td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  }

  function cargarUsuariosEnFiltro() {
    let usuarios = obtenerUsuarios();
    let nombres = usuarios.map((u) => u.usuario);
    selectFiltro.innerHTML = '<option value="Todos">Todos</option>';
    nombres.forEach((nombre) => {
      let option = document.createElement("option");
      option.value = nombre;
      option.textContent = nombre;
      selectFiltro.appendChild(option);
    });
  }

  btnActualizar.addEventListener("click", () => {
    cargarUsuariosEnFiltro();
    renderRanking();
  });

  cargarUsuariosEnFiltro();
  renderRanking();
}
