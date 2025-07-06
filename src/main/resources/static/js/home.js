document.addEventListener("DOMContentLoaded", function() {
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

    if (usuario) {
      userDropdownContainer.classList.remove('d-none');
      userDropdownName.textContent = usuario.nombreUsuario;
      if (loginBtnTop) loginBtnTop.classList.add('d-none');
      document.getElementById('userDropdownAvatar').src = usuario.avatarUrl || 'standard_pfp.png';

      // Cargar amigos
      let amigosData = []; // Guarda la lista completa
      let amigosIds = []; // Guarda los IDs de los amigos

      fetch(`/api/usuarios/${usuario.id}/amigos`)
        .then(res => res.ok ? res.json() : [])
        .then(amigos => {
          amigosData = amigos;
          amigosIds = amigos.map(a => a.id); // Extraer solo los IDs
          amigosCount.textContent = amigos.length;
          renderAmigosList(amigosData);
        });

      function renderAmigosList(amigos) {
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
      buscarAmigoInput.addEventListener('input', function() {
        const filtro = buscarAmigoInput.value.toLowerCase();
        renderAmigosList(amigosData.filter(a => a.nombreUsuario.toLowerCase().includes(filtro)));
      });

      // Cerrar sesión desde dropdown
      if (dropdownLogoutBtn) {
        dropdownLogoutBtn.onclick = function() {
          localStorage.removeItem('usuario');
          window.location.href = "/home";
        };
      }

      // Cargar solicitudes al abrir el modal y actualizar contador
      function actualizarSolicitudes() {
        fetch(`/api/solicitudes-amistad/pendientes/recibidas/${usuario.id}`)
          .then(res => res.ok ? res.json() : [])
          .then(solicitudes => {
            // Actualiza el contador en el dropdown
            if (solicitudes.length > 9) {
              solicitudesCount.textContent = "9+";
            } else {
              solicitudesCount.textContent = solicitudes.length;
            }
            // Actualiza la lista en el modal
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
            if (solicitudes.length > 0) {
              solicitudesCount.classList.add('animate__bounce');
            }
          });
      }

      // Llama a actualizarSolicitudes al cargar y al abrir el modal
      actualizarSolicitudes();
      document.getElementById('btn-solicitudes').addEventListener('click', actualizarSolicitudes);

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

      document.getElementById('bienvenida-usuario').textContent = `¡Bienvenido, ${usuario.nombreUsuario}!`;
      document.getElementById('bienvenida-usuario').classList.remove('d-none');
    } else {
      userDropdownContainer.classList.add('d-none');
      if (loginBtnTop) {
        loginBtnTop.classList.remove('d-none');
        loginBtnTop.onclick = () => window.location.href = "/login";
      }
    }

    if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
      adminBtnLi.style.display = "block";
    } else {
      adminBtnLi.style.display = "none";
    }

    const inputBuscarUsuario = document.getElementById('input-buscar-usuario');
    const usuariosBusquedaList = document.getElementById('usuarios-busqueda-list');

    document.getElementById('btn-buscar-usuarios').addEventListener('click', function() {
      fetch(`/api/usuarios/${usuario.id}/amigos`)
        .then(res => res.ok ? res.json() : [])
        .then(amigos => {
          amigosIds = amigos.map(a => a.id);
          fetch(`/api/solicitudes-amistad/pendientes/enviadas/${usuario.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(solicitudes => {
              solicitudesPendientesIds = solicitudes.map(s => s.usuarioReceptor.id);
            });
        });
    });

    inputBuscarUsuario.addEventListener('input', function() {
      const query = inputBuscarUsuario.value.trim();
      if (query.length < 2) {
        usuariosBusquedaList.innerHTML = "";
        return;
      }
      fetch(`/api/solicitudes-amistad/pendientes/enviadas/${usuario.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(solicitudes => {
          solicitudesPendientesIds = solicitudes.map(s => s.usuarioReceptor.id);
          fetch(`/api/usuarios/buscar?nombre=${encodeURIComponent(query)}&idSolicitante=${usuario.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(usuarios => {
              usuariosBusquedaList.innerHTML = usuarios
                .map(u =>
                  `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href="/perfil_publico?id=${u.id}" class="text-decoration-none">${u.nombreUsuario}</a>
                    ${
                      amigosIds.includes(u.id)
                        ? '<span class="badge bg-secondary ms-2">Ya es tu amigo</span>'
                        : solicitudesPendientesIds.includes(u.id)
                          ? '<span class="badge bg-warning text-dark ms-2">Ya solicitada</span>'
                          : `<button class="btn btn-primary btn-sm ms-2" onclick="enviarSolicitud(${u.id})">Solicitar amistad</button>`
                    }
                  </li>`
                ).join('');
            });
        });
    });

    window.enviarSolicitud = function(id) {
      fetch(`/api/solicitudes-amistad/enviar?emisorId=${usuario.id}&receptorId=${id}`, {method: 'POST'})
        .then(res => {
          if (res.ok) {
            alert('Solicitud enviada');
            fetch(`/api/solicitudes-amistad/pendientes/enviadas/${usuario.id}`)
              .then(res => res.ok ? res.json() : [])
              .then(solicitudes => {
                solicitudesPendientesIds = solicitudes.map(s => s.usuarioReceptor.id);
                inputBuscarUsuario.dispatchEvent(new Event('input'));
              });
          } else {
            alert('No se pudo enviar la solicitud');
          }
        });
    };

    if (usuario) {
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

      buscarConversacionInput.addEventListener('input', function() {
        const filtro = buscarConversacionInput.value.toLowerCase();
        renderConversaciones(conversacionesData.filter(c => c.amigo.nombreUsuario.toLowerCase().includes(filtro)));
      });

      btnMensajesDropdown.addEventListener('click', cargarConversaciones);

      let amigoChatId = null;
      window.abrirChat = function(amigoId, amigoNombre) {
        amigoChatId = amigoId;
        document.getElementById('nombre-amigo-chat').textContent = amigoNombre;
        fetch('/api/mensajes/marcar-leidos', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({usuarioId: usuario.id, amigoId: amigoId})
        }).then(() => {
          fetch(`/api/mensajes/conversacion?usuario1=${usuario.id}&usuario2=${amigoId}`)
            .then(res => res.ok ? res.json() : [])
            .then(mensajes => {
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
            });
        });
      };

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

    if (usuario) {
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

      buscarNotificacionInput.addEventListener('input', function() {
        const filtro = buscarNotificacionInput.value.toLowerCase();
        renderNotificaciones(notificacionesData.filter(n => n.mensaje.toLowerCase().includes(filtro)));
      });

      btnNotificacionesDropdown.addEventListener('click', cargarNotificaciones);

      marcarTodasLeidasBtn.addEventListener('click', function() {
        const ids = notificacionesData.filter(n => !n.leida).map(n => n.id);
        if (!ids.length) return;
        fetch('/api/notificaciones/marcar-leidas', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(ids)
        }).then(() => cargarNotificaciones());
      });

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