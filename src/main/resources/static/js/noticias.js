let todasNoticias = [];
const token = localStorage.getItem('token');

document.addEventListener("DOMContentLoaded", () => {
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const adminBtnLi = document.getElementById('admin-btn-li');
  const userDropdownContainer = document.getElementById('user-dropdown-container');
  const userDropdownName = document.getElementById('userDropdownName');
  const amigosList = document.getElementById('amigos-list');
  const solicitudesList = document.getElementById('solicitudes-list');
  const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');
  const amigosCount = document.getElementById('amigos-count');
  const solicitudesCount = document.getElementById('solicitudes-count');
  const loginBtnTop = document.getElementById('login-btn-top');
  const mensajesDropdownContainer = document.getElementById('mensajes-dropdown-container');
  const btnMensajesDropdown = document.getElementById('btn-mensajes-dropdown');
  const conversacionesList = document.getElementById('conversaciones-list');
  const buscarConversacionInput = document.getElementById('buscar-conversacion-input');
  const mensajesNoLeidosBadge = document.getElementById('mensajes-no-leidos-badge');
  const notificacionesDropdownContainer = document.getElementById('notificaciones-dropdown-container');
  const btnNotificacionesDropdown = document.getElementById('btn-notificaciones-dropdown');
  const notificacionesList = document.getElementById('notificaciones-list');
  const buscarNotificacionInput = document.getElementById('buscar-notificacion-input');
  const notificacionesNoLeidasBadge = document.getElementById('notificaciones-no-leidas-badge');
  const marcarTodasLeidasBtn = document.getElementById('marcar-todas-leidas-btn');
  let amigosIds = [];
  let solicitudesPendientesIds = [];

  if (usuario) {
    if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
    if (userDropdownName) userDropdownName.textContent = usuario.nombreUsuario;
    if (loginBtnTop) loginBtnTop.classList.add('d-none');
    if (document.getElementById('userDropdownAvatar')) {
      document.getElementById('userDropdownAvatar').src = usuario.avatarUrl || 'standard_pfp.png';
    }

    let amigosData = [];
    fetch(`/api/usuarios/${usuario.id}/amigos`)
      .then(res => res.ok ? res.json() : [])
      .then(amigos => {
        amigosData = amigos;
        amigosIds = amigos.map(a => a.id);
        if (amigosCount) amigosCount.textContent = amigos.length;
        renderAmigosList(amigosData);
      });

    function renderAmigosList(amigos) {
      if (!amigosList) return;
      if (!amigos.length) {
        amigosList.innerHTML = "<li class='list-group-item text-muted'>Sin amigos</li>";
      } else {
        amigosList.innerHTML = amigos.map(a =>
          `<li class="list-group-item py-1 px-2 d-flex justify-content-between align-items-center">
            <a href="/perfil_publico?id=${a.id}" class="text-decoration-none">${a.nombreUsuario}</a>
            <button class="btn btn-outline-primary btn-sm ms-2" title="Mensajes" onclick="abrirChat(${a.id},'${a.nombreUsuario}')">💬</button>
            <button class="btn btn-outline-danger btn-sm ms-2" onclick="eliminarAmigo(${a.id})" title="Eliminar amigo">✖</button>
          </li>`
        ).join('');
      }
    }

    const buscarAmigoInput = document.getElementById('buscar-amigo-input');
    if (buscarAmigoInput) {
      buscarAmigoInput.addEventListener('input', function() {
        const filtro = buscarAmigoInput.value.toLowerCase();
        renderAmigosList(amigosData.filter(a => a.nombreUsuario.toLowerCase().includes(filtro)));
      });
    }

    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.onclick = function() {
        localStorage.removeItem('usuario');
        window.location.href = "/home";
      };
    }

    function actualizarSolicitudes() {
      fetch(`/api/solicitudes-amistad/pendientes/recibidas/${usuario.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(solicitudes => {
          if (solicitudesCount) {
            if (solicitudes.length > 9) {
              solicitudesCount.textContent = "9+";
            } else {
              solicitudesCount.textContent = solicitudes.length;
            }
          }
          if (solicitudesList) {
            if (!solicitudes.length) {
              solicitudesList.innerHTML = "<li class='list-group-item text-muted'>No tienes solicitudes pendientes.</li>";
            } else {
              solicitudesList.innerHTML = solicitudes.map(s =>
                `<li class="list-group-item d-flex justify-content-between align-items-center">
                  <a href="/perfil_publico?id=${s.usuarioEmisor.id}" class="text-primary text-decoration-underline">${s.usuarioEmisor.nombreUsuario}</a>
                  <span>
                    <button class="btn btn-success btn-sm me-2" onclick="aceptarSolicitud(${s.id})">Aceptar</button>
                    <button class="btn btn-danger btn-sm" onclick="rechazarSolicitud(${s.id})">Rechazar</button>
                  </span>
                </li>`
              ).join('');
            }
          }
        });
    }
    if (document.getElementById('btn-solicitudes')) {
      actualizarSolicitudes();
      document.getElementById('btn-solicitudes').addEventListener('click', actualizarSolicitudes);
    }

    window.aceptarSolicitud = function(id) {
      fetch(`/api/solicitudes-amistad/${id}/aceptar`, {method: 'POST'})
        .then(res => res.ok ? location.reload() : alert('Error al aceptar solicitud'));
    };
    window.rechazarSolicitud = function(id) {
      fetch(`/api/solicitudes-amistad/${id}/rechazar`, {method: 'POST'})
        .then(res => res.ok ? location.reload() : alert('Error al rechazar solicitud'));
    };
    window.eliminarAmigo = function(id) {
      fetch(`/api/usuarios/${usuario.id}/amigos/${id}`, {method: 'DELETE'})
        .then(res => res.ok ? location.reload() : alert('Error al eliminar amigo'));
    };

    if (document.getElementById('bienvenida-usuario')) {
      document.getElementById('bienvenida-usuario').textContent = `¡Bienvenido, ${usuario.nombreUsuario}!`;
      document.getElementById('bienvenida-usuario').classList.remove('d-none');
    }
  } else {
    if (userDropdownContainer) userDropdownContainer.classList.add('d-none');
    if (loginBtnTop) {
      loginBtnTop.classList.remove('d-none');
      loginBtnTop.onclick = () => window.location.href = "/login";
    }
  }

  if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
    if (adminBtnLi) adminBtnLi.style.display = "block";
  } else {
    if (adminBtnLi) adminBtnLi.style.display = "none";
  }


  cargarNoticias();
  document.getElementById('filtroFecha').addEventListener('input', aplicarFiltros);
  document.getElementById('filtroSistema').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroTitulo').addEventListener('input', aplicarFiltros);

  document.getElementById('formNuevaNoticia').addEventListener('submit', function(e) {
    e.preventDefault();
    const noticia = {
      titulo: document.getElementById('tituloNoticia').value,
      sistemaRelacionado: { id: document.getElementById('sistemaNoticia').value },
      contenido: document.getElementById('contenidoNoticia').value,
      miniaturaUrl: document.getElementById('miniaturaNoticia').value
    };
    fetch('/api/noticias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(noticia)
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al crear la noticia");
      return res.json();
    })
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('crearNoticiaModal')).hide();
      this.reset();
      cargarNoticias();
    })
    .catch(err => alert(err.message));
  });

  const btnNuevaNoticia = document.querySelector('button[data-bs-target="#crearNoticiaModal"]');
  if (btnNuevaNoticia) {
    if (
      usuario &&
      (
        usuario.rol === "ADMIN" ||
        usuario.rol === "OWNER" ||
        (usuario.privilegios && usuario.privilegios.includes("USER_NEWS"))
      )
    ) {
      btnNuevaNoticia.style.display = "inline-block";
    } else {
      btnNuevaNoticia.style.display = "none";
    }
  }

  if (usuario && mensajesDropdownContainer) {
    mensajesDropdownContainer.style.display = '';
    let conversacionesData = [];

    function cargarConversaciones() {
      fetch(`/api/mensajes/conversaciones?usuarioId=${usuario.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(conversaciones => {
          conversacionesData = conversaciones;
          conversacionesData.sort((a, b) => {
            if (b.noLeidos !== a.noLeidos) return b.noLeidos - a.noLeidos;
            return new Date(b.ultimoMensaje.fechaEnvio) - new Date(a.ultimoMensaje.fechaEnvio);
          });
          renderConversaciones(conversacionesData);
          const totalNoLeidos = conversacionesData.reduce((sum, c) => sum + c.noLeidos, 0);
          if (totalNoLeidos > 0) {
            mensajesNoLeidosBadge.textContent = totalNoLeidos > 9 ? "9+" : totalNoLeidos;
            mensajesNoLeidosBadge.classList.remove('d-none');
          } else {
            mensajesNoLeidosBadge.classList.add('d-none');
          }
        });
    }

    function renderConversaciones(convs) {
      if (!conversacionesList) return;
      if (!convs.length) {
        conversacionesList.innerHTML = "<li class='list-group-item text-muted'>No tienes conversaciones.</li>";
        return;
      }
      conversacionesList.innerHTML = convs.map(c =>
        `<li class="list-group-item d-flex justify-content-between align-items-center pointer" onclick="abrirChat(${c.amigo.id}, '${c.amigo.nombreUsuario}')">
          <div>
            <span class="fw-bold">${c.amigo.nombreUsuario}</span><br>
            <span class="text-muted" style="font-size:0.9em;">${c.ultimoMensaje.contenido.length > 30 ? c.ultimoMensaje.contenido.slice(0,30)+'…' : c.ultimoMensaje.contenido}</span>
          </div>
          ${c.noLeidos > 0 ? `<span class="badge bg-danger ms-2">${c.noLeidos}</span>` : ''}
        </li>`
      ).join('');
    }

    if (buscarConversacionInput) {
      buscarConversacionInput.addEventListener('input', function() {
        const filtro = buscarConversacionInput.value.toLowerCase();
        renderConversaciones(conversacionesData.filter(c => c.amigo.nombreUsuario.toLowerCase().includes(filtro)));
      });
    }

    if (btnMensajesDropdown) btnMensajesDropdown.addEventListener('click', cargarConversaciones);

    let amigoChatId = null;
    window.abrirChat = function(amigoId, amigoNombre) {
      amigoChatId = amigoId;
      if (document.getElementById('nombre-amigo-chat')) {
        document.getElementById('nombre-amigo-chat').textContent = amigoNombre;
      }
      fetch('/api/mensajes/marcar-leidos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({usuarioId: usuario.id, amigoId: amigoId})
      }).then(() => {
        fetch(`/api/mensajes/conversacion?usuario1=${usuario.id}&usuario2=${amigoId}`)
          .then(res => res.ok ? res.json() : [])
          .then(mensajes => {
            if (document.getElementById('mensajes-contenido')) {
              document.getElementById('mensajes-contenido').innerHTML = mensajes.map(m =>
                `<div class="mb-2 ${m.emisor.id === usuario.id ? 'text-end' : 'text-start'}">
                  <span class="badge ${m.emisor.id === usuario.id ? 'bg-primary' : 'bg-secondary'}">${m.contenido}</span>
                  <div style="font-size:0.8em" class="text-muted">${new Date(m.fechaEnvio).toLocaleString()}</div>
                </div>`
              ).join('');
              new bootstrap.Modal(document.getElementById('modalMensajes')).show();
              setTimeout(() => {
                const cont = document.getElementById('mensajes-contenido');
                cont.scrollTop = cont.scrollHeight;
              }, 100);
            }
          });
      });
    };

    if (document.getElementById('btn-enviar-mensaje')) {
      document.getElementById('btn-enviar-mensaje').onclick = function() {
        const contenido = document.getElementById('input-mensaje').value.trim();
        if (!contenido) return;
        fetch('/api/mensajes/enviar', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({emisorId: usuario.id, receptorId: amigoChatId, contenido})
        }).then(() => {
          document.getElementById('input-mensaje').value = '';
          window.abrirChat(amigoChatId, document.getElementById('nombre-amigo-chat').textContent);
          cargarConversaciones();
        });
      };
    }
  }

  if (usuario && notificacionesDropdownContainer) {
    notificacionesDropdownContainer.style.display = '';
    let notificacionesData = [];

    function cargarNotificaciones() {
      fetch(`/api/notificaciones/todas/${usuario.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(notificaciones => {
          notificacionesData = notificaciones;
          renderNotificaciones(notificacionesData);
          const noLeidas = notificacionesData.filter(n => !n.leida).length;
          if (noLeidas > 0) {
            notificacionesNoLeidasBadge.textContent = noLeidas > 9 ? "9+" : noLeidas;
            notificacionesNoLeidasBadge.classList.remove('d-none');
          } else {
            notificacionesNoLeidasBadge.classList.add('d-none');
          }
        });
    }

    function renderNotificaciones(nots) {
      if (!notificacionesList) return;
      if (!nots.length) {
        notificacionesList.innerHTML = "<li class='list-group-item text-muted'>No tienes notificaciones.</li>";
        return;
      }
      notificacionesList.innerHTML = nots.map(n =>
        `<li class="list-group-item d-flex justify-content-between align-items-start ${n.leida ? '' : 'fw-bold'} pointer" onclick="abrirNotificacion(${n.id}, '${n.url ? n.url : '#'}')">
          <div>
            <span>${n.mensaje}</span><br>
            <span class="text-muted" style="font-size:0.85em;">${new Date(n.fecha).toLocaleString()}</span>
          </div>
          ${!n.leida ? '<span class="badge bg-danger ms-2">●</span>' : ''}
        </li>`
      ).join('');
    }

    if (buscarNotificacionInput) {
      buscarNotificacionInput.addEventListener('input', function() {
        const filtro = buscarNotificacionInput.value.toLowerCase();
        renderNotificaciones(notificacionesData.filter(n => n.mensaje.toLowerCase().includes(filtro)));
      });
    }

    if (btnNotificacionesDropdown) btnNotificacionesDropdown.addEventListener('click', cargarNotificaciones);

    if (marcarTodasLeidasBtn) {
      marcarTodasLeidasBtn.addEventListener('click', function() {
        const ids = notificacionesData.filter(n => !n.leida).map(n => n.id);
        if (!ids.length) return;
        fetch('/api/notificaciones/marcar-leidas', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(ids)
        }).then(() => cargarNotificaciones());
      });
    }

    window.abrirNotificacion = function(id, url) {
      fetch('/api/notificaciones/marcar-leidas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify([id])
      }).then(() => {
        if (url && url !== '#') window.location.href = url;
        else cargarNotificaciones();
      });
    };
  }
});

function cargarNoticias() {
  fetch("/api/noticias")
    .then(response => response.json())
    .then(data => {
      todasNoticias = data.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
      aplicarFiltros();
    })
    .catch(error => console.error("Error al cargar noticias:", error));
}

function aplicarFiltros() {
  const fecha = document.getElementById('filtroFecha').value;
  const sistema = document.getElementById('filtroSistema').value;
  const titulo = document.getElementById('filtroTitulo').value.toLowerCase();

  let filtradas = todasNoticias;

  if (fecha) {
    filtradas = filtradas.filter(n => n.fechaPublicacion && n.fechaPublicacion.startsWith(fecha));
  }
  if (sistema) {
    filtradas = filtradas.filter(n => n.sistemaRelacionado && String(n.sistemaRelacionado.id) === sistema);
  }
  if (titulo) {
    filtradas = filtradas.filter(n => n.titulo.toLowerCase().includes(titulo));
  }

  renderNoticias(filtradas);
}

function renderNoticias(noticias) {
  const container = document.getElementById("noticias-scroll");
  container.innerHTML = "";
  if (!noticias.length) {
    container.innerHTML = "<div class='text-muted'>No hay noticias para los filtros seleccionados.</div>";
    return;
  }
  noticias.forEach(noticia => {
    const autorHtml = noticia.autor
      ? `<a href="/perfil_publico?id=${noticia.autor.id}" class="text-primary text-decoration-underline">${noticia.autor.nombreUsuario}</a>`
      : 'Anónimo';
    const tarjeta = document.createElement("a");
    tarjeta.href = `detalles_noticias/${noticia.id}`;
    tarjeta.className = "news-card";
    tarjeta.innerHTML = `
      <img src="${noticia.miniaturaUrl || 'placeholder.png'}" class="news-thumbnail" alt="Miniatura">
      <div class="news-info">
        <div class="news-title">${noticia.titulo}</div>
        <div class="news-date">${formatearFecha(noticia.fechaPublicacion)}</div>
        <div class="news-summary">${noticia.contenido.substring(0, 120)}...</div>
        <div class="news-autor"><strong>Autor:</strong> ${autorHtml}</div>
      </div>
    `;
    container.appendChild(tarjeta);
  });
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  const fecha = new Date(fechaIso).toLocaleDateString('es-ES', opciones);
  return fecha.replace(/^([0-9]{1,2}) de ([a-záéíóúñ]+)/i, (match, dia, mes) =>
    `${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
  );
}

document.addEventListener("DOMContentLoaded", function() {
  fetch('/api/sistemas-juego')
    .then(res => res.ok ? res.json() : [])
    .then(sistemas => {
      const filtroSelect = document.getElementById('filtroSistema');
      if (filtroSelect) {
        filtroSelect.innerHTML = '<option value="">Todos los sistemas</option>';
        sistemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nombre;
          filtroSelect.appendChild(opt);
        });
      }
      const modalSelect = document.getElementById('sistemaNoticia');
      if (modalSelect) {
        modalSelect.innerHTML = '<option value="">Selecciona sistema</option>';
        sistemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id; 
          opt.textContent = s.nombre;
          modalSelect.appendChild(opt);
        });
      }
    });
});