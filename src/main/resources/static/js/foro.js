let activeCategory = 'all';
let foros = [];

document.addEventListener("DOMContentLoaded", function() {
  //Se inicializan las variables y se comprueba si el usuario está logueado para cambiar los botones
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const perfilBtn = document.getElementById('perfil-btn');
  const adminBtnLi = document.getElementById('admin-btn-li');

  if (usuario) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    perfilBtn.style.display = "block";
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    perfilBtn.style.display = "none";
  }
  if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
    adminBtnLi.style.display = "block";
  } else {
    adminBtnLi.style.display = "none";
  }

  logoutBtn.addEventListener("click", function() {
    localStorage.removeItem('usuario');
    window.location.href = "/home";
  });

  // Cargar sistemas de juego en filtros y modal
  fetch('/api/sistemas-juego')
    .then(res => res.ok ? res.json() : [])
    .then(sistemas => {
      const filtroSelect = document.getElementById('filtro-sistema');
      if (filtroSelect) {
        sistemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nombre;
          filtroSelect.appendChild(opt);
        });
      }
      const modalSelect = document.getElementById('sistemaJuego');
      if (modalSelect) {
        sistemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nombre;
          modalSelect.appendChild(opt);
        });
      }
    });
  cargarForos();
  document.getElementById('crearForoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!usuario) {
      alert("Debes iniciar sesión para crear un foro.");
      return;
    }
    const titulo = document.getElementById('titulo').value;
    const mensajeInicial = document.getElementById('mensaje').value;
    const categoria = document.getElementById('categoria').value;
    const sistemaJuegoId = document.getElementById('sistemaJuego').value;

    fetch('/api/foros?sistemaJuegoId=' + encodeURIComponent(sistemaJuegoId) + '&autorId=' + encodeURIComponent(usuario.id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: titulo,
        mensajeInicial: mensajeInicial,
        categoria: categoria
      })
    })
    .then(res => {
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('crearForoModal')).hide();
        document.getElementById('crearForoForm').reset();
        cargarForos();
      } else {
        return res.text().then(msg => { throw new Error(msg); });
      }
    })
    .catch(err => alert('Error al crear foro: ' + err.message));
  });
});

function cargarForos() {
  fetch('/api/foros')
    .then(res => res.json())
    .then(data => {
      foros = data;
      renderForos();
      applyFilters();
    });
}

function renderForos() {
  const foroList = document.getElementById('foro-list');
  if (!foros.length) {
    foroList.innerHTML = "<div class='text-muted'>No hay foros disponibles.</div>";
    return;
  }
  foroList.innerHTML = foros.map(foro => `
    <a href="/foro_detail?foroId=${foro.id}" class="text-decoration-none text-dark">
      <div class="foro-card card mb-2" 
           data-category="${foro.categoria}" 
           data-fecha="${foro.fechaCreacion}" 
           data-titulo="${foro.titulo}"
           data-sistema-id="${foro.sistemaJuego?.id || ''}">
        <div class="card-body">
          <h5 class="card-title mb-1">${foro.titulo}</h5>
          <p class="mb-1"><strong>Creado por:</strong> ${foro.autor?.nombreUsuario || 'Anónimo'} | <strong>Fecha:</strong> ${new Date(foro.fechaCreacion).toLocaleDateString()}</p>
          <p class="mb-1"><strong>Respuestas:</strong> ${foro.respuestas || 0} | <strong>Visitas:</strong> ${foro.visitas || 0} | <strong>Categoría:</strong> ${foro.categoria} | <strong>Sistema:</strong> ${foro.sistemaJuego?.nombre || '-'}</p>
        </div>
      </div>
    </a>
  `).join('');
}

function filterCategory(category) {
  activeCategory = category;
  // Cambia el texto del botón según la categoría seleccionada
  const btn = document.getElementById('categoryFilterBtn');
  let text = "Categoría";
  if (category === 'all') text = "Todas";
  else text = category;
  btn.textContent = text;
  applyFilters();
}

function applyFilters() {
  const cards = document.querySelectorAll('.foro-card');
  const titleText = document.getElementById('titleFilter').value.toLowerCase();
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  const sistemaId = document.getElementById('filtro-sistema').value;

  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    const title = card.getAttribute('data-titulo').toLowerCase();
    const fecha = card.getAttribute('data-fecha');
    const cardSistemaId = card.getAttribute('data-sistema-id');
    let show = true;
    // Filtro por categoría
    if (activeCategory !== 'all' && cat !== activeCategory) show = false;
    // Filtro por título
    if (titleText && !title.includes(titleText)) show = false;
    // Filtro por fechas
    if (fecha) {
      const cardDate = new Date(fecha);
      if (dateFrom) {
        const fromDate = new Date(dateFrom + "T00:00:00");
        if (cardDate < fromDate) show = false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo + "T23:59:59");
        if (cardDate > toDate) show = false;
      }
    }
    // Filtro por sistema de juego
    if (sistemaId && cardSistemaId !== sistemaId) show = false;
    card.parentElement.style.display = show ? '' : 'none';
  });
}