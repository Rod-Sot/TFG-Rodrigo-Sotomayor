document.addEventListener("DOMContentLoaded", function() {
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
    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem('usuario');
      window.location.href = "/home";
    });

    if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
      adminBtnLi.style.display = "block";
    } else {
      adminBtnLi.style.display = "none";
    }

    cargarPartidas();
    // Cargar sistemas en el filtro y en el modal
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
  });

  document.getElementById('crearPartidaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    if (!usuario) {
      alert("Debes iniciar sesión para crear una partida.");
      return;
    }

    const partida = {
      titulo: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      sistemaJuego: { id: document.getElementById('sistemaJuego').value },
      duracion: document.getElementById('duracion').value,
      maxJugadores: document.getElementById('jugadores').value,
      estado: "Abierta",
      creador: { id: usuario.id }
    };

    fetch('/api/partidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partida)
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al crear la partida");
      return res.json();
    })
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('crearPartidaModal')).hide();
      document.getElementById('crearPartidaForm').reset();
      cargarPartidas();
    })
    .catch(err => alert(err.message));
  });

  function cargarPartidas() {
    fetch('/api/partidas')
      .then(res => res.ok ? res.json() : [])
      .then(partidas => {
        const cont = document.getElementById('partidas-list');
        if (!cont) return;
        if (!partidas.length) {
          cont.innerHTML = "<div class='text-muted'>No hay partidas disponibles.</div>";
          return;
        }
        cont.innerHTML = partidas.map(p => `
          <a href="/partida_detail?partidaId=${p.id}" class="text-decoration-none text-dark">
            <div class="card mb-3 foro-card" style="cursor:pointer;">
              <div class="card-body">
                <span class="badge bg-primary mb-2">Partida</span>
                <h5 class="card-title">${p.titulo}</h5>
                <p class="mb-1"><strong>Creador:</strong> ${p.creador?.nombreUsuario || 'Anónimo'}</p>
                <p class="card-text">${p.descripcion}</p>
                <p class="mb-1">
                  <strong>Sistema:</strong> ${p.sistemaJuego?.nombre || '-'} |
                  <strong>Duración:</strong> ${p.duracion} |
                  <strong>Jugadores:</strong> ${p.jugadoresActuales || 0} / ${p.maxJugadores} |
                </p>
              </div>
            </div>
          </a>
        `).join('');
      });
  }