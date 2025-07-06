document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Debes iniciar sesión como administrador.");
    window.location.href = "/login";
    return;
  }
  const usuarioStr = localStorage.getItem('usuario');
  const usuarioLogueado = usuarioStr ? JSON.parse(usuarioStr) : null;
  let usuarios = [];
  let sistemas = [];
  let foros = [];
  let partidas = [];
  function cargarUsuarios() {
    fetch('/api/usuarios/admin/usuarios', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        alert("Acceso denegado. Solo administradores.");
        window.location.href = "/home";
        return;
      }
      return res.json();
    })
    .then(usuariosData => {
      if (!usuariosData) return;
      usuarios = usuariosData;
      const usuariosList = document.getElementById('usuarios-list');
      usuariosList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Partidas creadas</th>
              <th>Partidas jugadas</th>
              <th>Sistemas seguidos</th>
              <th>Noticias publicadas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${usuariosData.map(u => `
              <tr>
                <td>
                  <a href="/perfil_publico?id=${u.id}" class="text-decoration-none text-primary" target="_blank">
                    ${u.nombreUsuario}
                  </a>
                </td>
                <td>${u.email}</td>
                <td>${u.partidasCreadas ? u.partidasCreadas.length : 0}</td>
                <td>${u.partidasComoJugador ? u.partidasComoJugador.length : 0}</td>
                <td>${u.sistemasSeguidos ? u.sistemasSeguidos.length : 0}</td>
                <td>${
                  (u.rol === "USER_NEWS" || u.rol === "ADMIN" || u.rol === "OWNER")
                    ? (u.noticiasPublicadas ? u.noticiasPublicadas.length : 0)
                    : "-"
                }</td>
                <td>
                  <button class="btn btn-info btn-sm" onclick="verDetalles('${u.id}')">Ver detalles</button>
                  ${
                    usuarioLogueado && usuarioLogueado.rol === "OWNER" && (u.rol === "USER" || u.rol === "USER_NEWS")
                      ? `<button class="btn btn-warning btn-sm" onclick="ascenderAdmin('${u.id}')">Promocionar a Admin</button>`
                      : ""
                  }
                  ${
                    usuarioLogueado && usuarioLogueado.rol === "OWNER" && u.rol === "ADMIN"
                      ? `<button class="btn btn-secondary btn-sm" onclick="revocarAdmin('${u.id}')">Degradar a Usuario</button>`
                      : ""
                  }
                  ${
                    (usuarioLogueado && (usuarioLogueado.rol === "ADMIN" || usuarioLogueado.rol === "OWNER") && u.rol !== "OWNER")
                      ? `<button class="btn btn-dark btn-sm" onclick="abrirGestionUsuario('${u.id}')">Gestión usuario</button>`
                      : ""
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });
  }

  function ascenderAdmin(id) {
    fetch(`/api/usuarios/admin/usuarios/${id}/ascender`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(() => cargarUsuarios());
  }

  function revocarAdmin(id) {
    fetch(`/api/usuarios/admin/usuarios/${id}/revocar`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(() => cargarUsuarios());
  }

  function banearUsuario(id) {
    fetch(`/api/usuarios/admin/usuarios/${id}/banear`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(() => cargarUsuarios());
  }

  function abrirGestionUsuario(id) {
    const usuario = usuarios.find(u => u.id == id);
    if (!usuario) return;

    let html = `
      <strong>Usuario:</strong> ${usuario.nombreUsuario}<br>
      <strong>Rol actual:</strong> ${usuario.rol}<br>
      <strong>Baneado:</strong> ${usuario.baneado ? "Sí" : "No"}<br>
      <hr>
      <button class="btn btn-sm btn-outline-primary mb-2" onclick="toggleNews('${usuario.id}', ${usuario.rol === 'USER_NEWS'})">
        ${usuario.rol === 'USER_NEWS' ? 'Quitar permisos de noticias' : 'Dar permisos de noticias'}
      </button>
      <br>
      <button class="btn btn-sm btn-outline-danger mb-2" onclick="banearUsuario('${usuario.id}')">
        ${usuario.baneado ? 'Desbanear usuario' : 'Banear usuario'}
      </button>
    `;

    document.getElementById('gestion-usuario-body').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('gestionUsuarioModal'));
    modal.show();
  }

  function toggleNews(id, esNews) {
    fetch(`/api/usuarios/admin/usuarios/${id}/${esNews ? 'quitar-news' : 'dar-news'}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(() => {
      cargarUsuarios();
      bootstrap.Modal.getInstance(document.getElementById('gestionUsuarioModal')).hide();
    });
  }

  function verDetalles(id) {
    const usuario = usuarios.find(u => u.id == id);
    if (!usuario) return;

    let html = `
      <strong>Usuario:</strong> ${usuario.nombreUsuario}<br>
      <strong>Email:</strong> ${usuario.email}<br>
      <strong>Rol:</strong> ${usuario.rol}<br>
      <strong>Partidas creadas:</strong> ${usuario.partidasCreadas?.length ?? 0}<br>
      <strong>Partidas jugadas:</strong> ${usuario.partidasComoJugador?.length ?? 0}<br>
      <strong>Sistemas seguidos:</strong> ${usuario.sistemasSeguidos?.length ?? 0}<br>
      <strong>Noticias publicadas:</strong> ${(usuario.rol === "USER_NEWS" || usuario.rol === "ADMIN" || usuario.rol === "OWNER") ? (usuario.noticiasPublicadas?.length ?? 0) : "-"}<br>
      <hr>
      <strong>Listado de sistemas seguidos:</strong>
      <ul>
        ${(usuario.sistemasSeguidos && usuario.sistemasSeguidos.length > 0)
          ? usuario.sistemasSeguidos.map(s => `<li>${s.nombre}</li>`).join('')
          : '<li>No sigue ningún sistema</li>'}
      </ul>
      <strong>Listado de partidas creadas:</strong>
      <ul>
        ${(usuario.partidasCreadas && usuario.partidasCreadas.length > 0)
          ? usuario.partidasCreadas.map(p => `<li>${p.nombre}</li>`).join('')
          : '<li>No ha creado partidas</li>'}
      </ul>
      <strong>Listado de partidas jugadas:</strong>
      <ul>
        ${(usuario.partidasComoJugador && usuario.partidasComoJugador.length > 0)
          ? usuario.partidasComoJugador.map(p => `<li>${p.nombre}</li>`).join('')
          : '<li>No ha jugado partidas</li>'}
      </ul>
      ${(usuario.rol === "USER_NEWS" || usuario.rol === "ADMIN" || usuario.rol === "OWNER") ? `
        <strong>Noticias publicadas:</strong>
        <ul>
          ${(usuario.noticiasPublicadas && usuario.noticiasPublicadas.length > 0)
            ? usuario.noticiasPublicadas.map(n => `<li>${n.titulo}</li>`).join('')
            : '<li>No ha publicado noticias</li>'}
        </ul>
      ` : ''}
    `;

    document.getElementById('usuario-detalles-body').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('usuarioDetallesModal'));
    modal.show();
  }

  function cargarNoticias() {
    fetch('/api/noticias/admin/noticias', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(noticias => {
      const noticiasList = document.getElementById('noticias-list');
      noticiasList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Sistema</th>
              <th>Fecha</th>
              <th>Likes</th>
              <th>Dislikes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${noticias.map(n => `
              <tr>
                <td>${n.titulo}</td>
                <td>${n.autor?.nombreUsuario ?? '-'}</td>
                <td>${n.sistemaRelacionado?.nombre ?? '-'}</td>
                <td>${n.fechaPublicacion ?? '-'}</td>
                <td>${n.meGusta}</td>
                <td>${n.noMeGusta}</td>
                <td>${n.estado ?? '-'}</td>
                <td>
                  <button class="btn btn-info btn-sm" onclick="verNoticia('${n.id}')">Ver</button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarNoticia('${n.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });
  }

  function verNoticia(id) {
    window.open(`/detalles_noticias/${id}`, '_blank');
  }

  function eliminarNoticia(id) {
    if (confirm("¿Seguro que quieres eliminar esta noticia?")) {
      fetch(`/api/noticias/admin/noticias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(() => cargarNoticias());
    }
  }

  function cargarSistemas() {
    fetch('/api/sistemas-juego/admin/sistemas', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
      sistemas = data;
      const sistemasList = document.getElementById('sistemas-list');
      sistemasList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Seguidores</th>
              <th>Documentos</th>
              <th>Noticias</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${sistemas.map(s => `
              <tr>
                <td>${s.nombre}</td>
                <td>${s.descripcion ? s.descripcion.substring(0, 50) + '...' : ''}</td>
                <td>${s.seguidores ? s.seguidores.length : 0}</td>
                <td>${s.documentos ? s.documentos.length : 0}</td>
                <td>${s.noticiasRelacionadas ? s.noticiasRelacionadas.length : 0}</td>
                <td>
                  <button class="btn btn-info btn-sm" onclick="verSistema('${s.id}')">Ver</button>
                  <button class="btn btn-warning btn-sm" onclick="editarSistema('${s.id}')">Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarSistema('${s.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });
  }

  function verSistema(id) {
    window.open(`/sistema_detail?sistemaId=${id}`, '_blank');
  }

  function eliminarSistema(id) {
    if (confirm("¿Seguro que quieres eliminar este sistema?")) {
      fetch(`/api/sistemas-juego/admin/sistemas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(() => cargarSistemas());
    }
  }

  document.getElementById('btn-crear-sistema').addEventListener('click', () => {
    document.getElementById('formSistema').reset();
    document.getElementById('sistemaId').value = '';
    document.getElementById('sistemaModalLabel').textContent = 'Crear Sistema';
    new bootstrap.Modal(document.getElementById('sistemaModal')).show();
  });

  function editarSistema(id) {
    const sistema = sistemas.find(s => s.id == id);
    if (!sistema) return;
    document.getElementById('sistemaId').value = sistema.id;
    document.getElementById('nombreSistema').value = sistema.nombre;
    document.getElementById('descripcionSistema').value = sistema.descripcion || '';
    document.getElementById('imagenSistema').value = sistema.imagenUrl || '';
    document.getElementById('sistemaModalLabel').textContent = 'Editar Sistema';
    new bootstrap.Modal(document.getElementById('sistemaModal')).show();
  }

  document.getElementById('formSistema').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('sistemaId').value;
    const sistema = {
      nombre: document.getElementById('nombreSistema').value,
      descripcion: document.getElementById('descripcionSistema').value,
      imagenUrl: document.getElementById('imagenSistema').value
    };
    const url = id ? `/api/sistemas-juego/admin/sistemas/${id}` : '/api/sistemas-juego/admin/sistemas';
    const method = id ? 'PUT' : 'POST';
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(sistema)
    }).then(() => {
      bootstrap.Modal.getInstance(document.getElementById('sistemaModal')).hide();
      cargarSistemas();
    });
  });

  function cargarForos() {
    fetch('/api/foros/admin/foros', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
      foros = data;
      const forosList = document.getElementById('foros-list');
      forosList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Sistema</th>
              <th>Autor</th>
              <th>Fecha</th>
              <th>Respuestas</th>
              <th>Visitas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${foros.map(f => `
              <tr>
                <td>${f.titulo}</td>
                <td>${f.categoria}</td>
                <td>${f.sistemaJuego?.nombre ?? '-'}</td>
                <td>${f.autor?.nombreUsuario ?? '-'}</td>
                <td>${f.fechaCreacion ? new Date(f.fechaCreacion).toLocaleDateString() : '-'}</td>
                <td>${f.respuestas ?? 0}</td>
                <td>${f.visitas ?? 0}</td>
                <td>
                  <button class="btn btn-info btn-sm" onclick="verForo('${f.id}')">Ver</button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarForo('${f.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });
  }

  function verForo(id) {
    window.open(`/foro_detail?foroId=${id}`, '_blank');
  }

  function eliminarForo(id) {
    if (confirm("¿Seguro que quieres eliminar este foro?")) {
      fetch(`/api/foros/admin/foros/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(() => cargarForos());
    }
  }

  function cargarPartidas() {
    fetch('/api/partidas/admin/partidas', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
      partidas = data;
      const partidasList = document.getElementById('partidas-list');
      partidasList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Sistema</th>
              <th>Fecha creación</th>
              <th>Estado</th>
              <th>Participantes</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${partidas.map(p => `
              <tr>
                <td>${p.titulo}</td>
                <td>${p.creador?.nombreUsuario ?? '-'}</td>
                <td>${p.sistemaJuego?.nombre ?? '-'}</td>
                <td>${p.fechaCreacion ?? '-'}</td>
                <td>${p.estado ?? '-'}</td>
                <td>${
                  (p.estado === 'Abierta' || p.estado === 'En progreso')
                    ? `${p.jugadores?.length ?? 0} / ${p.maxJugadores ?? '-'}`
                    : '-'
                }</td>
                <td>${p.duracion ?? '-'}</td>
                <td>
                  <button class="btn btn-info btn-sm" onclick="verPartida('${p.id}')">Ver</button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarPartida('${p.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });
  }

  function verPartida(id) {
    window.open(`/partida_detail?partidaId=${id}`, '_blank');
  }

  function eliminarPartida(id) {
    if (confirm("¿Seguro que quieres eliminar esta partida?")) {
      fetch(`/api/partidas/admin/partidas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(() => cargarPartidas());
    }
  }

  document.getElementById('foros-tab').addEventListener('click', cargarForos);
  document.getElementById('partidas-tab').addEventListener('click', cargarPartidas);

  // Carga inicial de usuarios
  cargarUsuarios();

  document.getElementById('usuarios-tab').addEventListener('click', cargarUsuarios);
  document.getElementById('noticias-tab').addEventListener('click', cargarNoticias);
  document.getElementById('sistemas-tab').addEventListener('click', cargarSistemas);

  // Scope global => botones dinamicos
  window.verDetalles = verDetalles;
  window.abrirGestionUsuario = abrirGestionUsuario;
  window.toggleNews = toggleNews;
  window.banearUsuario = banearUsuario;
  window.ascenderAdmin = ascenderAdmin;
  window.revocarAdmin = revocarAdmin;
  window.verNoticia = verNoticia;
  window.eliminarNoticia = eliminarNoticia;
  window.verSistema = verSistema;
  window.editarSistema = editarSistema;
  window.eliminarSistema = eliminarSistema;
  window.verForo = verForo;
  window.eliminarForo = eliminarForo;
  window.verPartida = verPartida;
  window.eliminarPartida = eliminarPartida;
});