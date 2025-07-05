document.addEventListener("DOMContentLoaded", function() {
  //Login/Logout/Profile
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const perfilBtn = document.getElementById('perfil-btn');
  if (loginBtn && logoutBtn && perfilBtn) {
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
  }
  // --- Detalles de la partida ---
  function getPartidaId() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("partidaId")) return params.get("partidaId");
    const pathParts = window.location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return !isNaN(Number(lastPart)) ? lastPart : null;
  }
  function cargarDetallesPartida() {
    const partidaId = getPartidaId();
    const cont = document.getElementById('partida-detalles');
    if (!partidaId) {
      cont.innerHTML = "<div class='alert alert-danger'>No se ha especificado la partida.</div>";
      return;
    }
    fetch(`/api/partidas/${partidaId}`)
      .then(res => res.ok ? res.json() : Promise.reject("No se pudo cargar la partida"))
      .then(p => {
        const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
        const esCreador = usuario && p.creador && usuario.id === p.creador.id;
        const yaUnido = usuario && p.jugadores && p.jugadores.some(j => j.id === usuario.id);
        const plazasRestantes = Math.max(0, p.maxJugadores - (p.jugadores ? p.jugadores.length : 0));
        let botonUnirse = '';
        if (esCreador) {
          botonUnirse = `<button class="btn btn-secondary btn-lg" disabled>Eres el director</button>`;
        } else if (yaUnido) {
          botonUnirse = `<button class="btn btn-secondary btn-lg" disabled>Ya estás unido</button>`;
        } else if (plazasRestantes > 0) {
          botonUnirse = `<button class="btn btn-success btn-lg" id="unirse-btn">Unirse a la partida</button>`;
        } else {
          botonUnirse = `<button class="btn btn-secondary btn-lg" disabled>Partida completa</button>`;
        }
        cont.innerHTML = `
          <span class="badge badge-partida mb-2">Partida</span>
          <h2 class="section-title">${p.titulo}</h2>
          <p><strong>Descripción:</strong> ${p.descripcion}</p>
          <div class="row my-3">
            <div class="col-md-6">
              <p><strong>Sistema:</strong> ${p.sistemaJuego?.nombre || '-'}</p>
              <p><strong>Duración:</strong> ${p.duracion}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Máx. Jugadores:</strong> ${p.maxJugadores}</p>
              <p><strong>Plazas restantes:</strong> ${plazasRestantes}</p>
            </div>
          </div>
          <div class="my-3">
            <p><strong>Director:</strong> <span>${p.creador?.nombreUsuario || 'Anónimo'}</span></p>
            <p><strong>Creada el:</strong> ${p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString("es-ES") : '-'}</p>
          </div>
          <div class="d-grid mt-4">
            ${botonUnirse}
          </div>
          <div class="mt-4">
            <h5>Jugadores:</h5>
            <ul id="lista-jugadores" class="list-group">
              ${(p.jugadores || []).map(j => `<li class="list-group-item">${j.nombreUsuario}</li>`).join('')}
            </ul>
          </div>
        `;
        const unirseBtn = document.getElementById('unirse-btn');
        if (unirseBtn) {
          unirseBtn.addEventListener('click', function() {
            if (!usuario) {
              alert('Debes iniciar sesión para unirte.');
              return;
            }
            fetch(`/api/partidas/${partidaId}/unirse?usuarioId=${usuario.id}`, { method: "POST" })
              .then(res => {
                if (res.ok) {
                  location.reload();
                } else {
                  return res.text().then(msg => { throw new Error(msg); });
                }
              })
              .catch(err => alert(err.message));
          });
        }
      })
      .catch(err => {
        cont.innerHTML = `<div class='alert alert-danger'>${err}</div>`;
      });
  }
  
  cargarDetallesPartida();
  const usuarioStr = localStorage.getItem('usuario');
  const adminBtnLi = document.getElementById('admin-btn-li');

  if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
    adminBtnLi.style.display = "block";
  } else {
    adminBtnLi.style.display = "none";
  }
});