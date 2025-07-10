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
  let amigosIds = [];
  let solicitudesPendientesIds = [];

  if (usuario) {
    if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
    if (userDropdownName) userDropdownName.textContent = usuario.nombreUsuario;
    if (loginBtnTop) loginBtnTop.classList.add('d-none');
    if (document.getElementById('userDropdownAvatar')) {
      document.getElementById('userDropdownAvatar').src = usuario.avatarUrl || '/standard_pfp.png';
    }

    // Cargar amigos
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

    // Buscador de amigos
    const buscarAmigoInput = document.getElementById('buscar-amigo-input');
    if (buscarAmigoInput) {
      buscarAmigoInput.addEventListener('input', function() {
        const filtro = buscarAmigoInput.value.toLowerCase();
        renderAmigosList(amigosData.filter(a => a.nombreUsuario.toLowerCase().includes(filtro)));
      });
    }

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

    // --- Modal de chat ---
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

  let noticiaId = null;
  const params = new URLSearchParams(window.location.search);
  if (params.has("noticiaId")) {
    noticiaId = params.get("noticiaId");
  } else {
    const pathParts = window.location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(Number(lastPart))) {
      noticiaId = lastPart;
    }
  }

  function formatearFechaConMesMayus(fechaIso) {
    const fecha = new Date(fechaIso);
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    return fechaFormateada.replace(/ de (\w+)/, (_, mes) => ` de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`);
  }
  function getUsuarioActual() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return null;
    try {
      return JSON.parse(usuarioStr);
    } catch {
      return null;
    }
  }
  if (noticiaId) {
    fetch(`/api/noticias/${noticiaId}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la noticia");
        return res.json();
      })
      .then(noticia => {
        document.getElementById("noticia-detalle").innerHTML = `
          
          <div class="news-title" id="titulo">${noticia.titulo}</div>
          <div class="news-meta">
            Publicado el <span id="fechaPublicacion">${formatearFechaConMesMayus(noticia.fechaPublicacion)}</span>
            por ${
              noticia.autor
                ? `<a href="/perfil_publico?id=${noticia.autor.id}" class="text-primary text-decoration-underline">${noticia.autor.nombreUsuario}</a>`
                : "<strong>Anónimo</strong>"
            }
            <span class="ms-2 text-muted" id="sistema">
              ${noticia.sistemaRelacionado?.nombre ? "Sistema: " + noticia.sistemaRelacionado.nombre : ""}
            </span>
          </div>
          <p id="contenido">${noticia.contenido}</p>
          <div class="reaction-buttons">
            <button id="like-btn">👍 Me gusta <span id="like-count">${noticia.meGusta || 0}</span></button>
            <button id="dislike-btn">👎 No me gusta <span id="dislike-count">${noticia.noMeGusta || 0}</span></button>
          </div>
          <div class="comment-section">
            <h6>Comentarios</h6>
            <div id="comentarios-list"></div>
            <form id="comentario-form" class="mt-3">
              <div class="mb-2">
                <textarea class="form-control" id="comentario-contenido" rows="2" placeholder="Escribe un comentario..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Publicar comentario</button>
            </form>
          </div>
        `;

        // login/logout/perfil
        const usuario = getUsuarioActual();
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const perfilBtn = document.getElementById('perfil-btn');

        if (usuario) {
          if (loginBtn) loginBtn.style.display = "none";
          if (logoutBtn) logoutBtn.style.display = "block";
          if (perfilBtn) perfilBtn.style.display = "block";
        } else {
          if (loginBtn) loginBtn.style.display = "block";
          if (logoutBtn) logoutBtn.style.display = "none";
          if (perfilBtn) perfilBtn.style.display = "none";
        }
        if (logoutBtn) {
          logoutBtn.addEventListener("click", function() {
            localStorage.removeItem('usuario');
            window.location.href = "/home";
          });
        }

        function comprobarVoto() {
          if (!usuario) {
            document.getElementById("like-btn").disabled = true;
            document.getElementById("dislike-btn").disabled = true;
            return;
          }
          fetch(`/api/noticias/${noticiaId}/voto?usuarioId=${usuario.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.haVotado) {
                if (data.tipoVoto === "like") {
                  document.getElementById("like-btn").disabled = true;
                  document.getElementById("dislike-btn").disabled = false;
                } else if (data.tipoVoto === "dislike") {
                  document.getElementById("like-btn").disabled = false;
                  document.getElementById("dislike-btn").disabled = true;
                }
              } else {
                document.getElementById("like-btn").disabled = false;
                document.getElementById("dislike-btn").disabled = false;
              }
            });
        }

        function bloquearBotones() {
          document.getElementById("like-btn").disabled = true;
          document.getElementById("dislike-btn").disabled = true;
        }

        function desbloquearBotones() {
          document.getElementById("like-btn").disabled = false;
          document.getElementById("dislike-btn").disabled = false;
        }

        document.getElementById("like-btn").addEventListener("click", function() {
          if (!usuario) {
            alert("Debes iniciar sesión para votar.");
            return;
          }
          bloquearBotones();
          fetch(`/api/noticias/${noticiaId}/like?usuarioId=${usuario.id}`, { method: "POST" })
            .then(() => fetch(`/api/noticias/${noticiaId}`))
            .then(res => res.json())
            .then(noticiaActualizada => {
              document.getElementById("like-count").textContent = noticiaActualizada.meGusta;
              document.getElementById("dislike-count").textContent = noticiaActualizada.noMeGusta;
              comprobarVoto();
            })
            .catch(() => desbloquearBotones());
        });

        document.getElementById("dislike-btn").addEventListener("click", function() {
          if (!usuario) {
            alert("Debes iniciar sesión para votar.");
            return;
          }
          bloquearBotones();
          fetch(`/api/noticias/${noticiaId}/dislike?usuarioId=${usuario.id}`, { method: "POST" })
            .then(() => fetch(`/api/noticias/${noticiaId}`))
            .then(res => res.json())
            .then(noticiaActualizada => {
              document.getElementById("like-count").textContent = noticiaActualizada.meGusta;
              document.getElementById("dislike-count").textContent = noticiaActualizada.noMeGusta;
              comprobarVoto();
            })
            .catch(() => desbloquearBotones());
        });

        comprobarVoto();
        function cargarComentarios() {
          fetch(`/api/comentarios/noticia/${noticiaId}`)
            .then(res => res.json())
            .then(comentarios => {
              const comentariosList = document.getElementById("comentarios-list");
              document.querySelector(".comment-section h6").textContent = `Comentarios (${comentarios.length})`;
              if (comentarios.length === 0) {
                comentariosList.innerHTML = "<div class='text-muted'>No hay comentarios aún.</div>";
              } else {
                comentariosList.innerHTML = comentarios.map(c =>
                  `<div class="comment">
                    <strong>${
                      c.autor
                        ? `<a href="/perfil_publico?id=${c.autor.id}" class="text-primary text-decoration-underline">${c.autor.nombreUsuario}</a>`
                        : "Anónimo"
                    }</strong>:
                    <span>${c.contenido}</span>
                    <div class="text-muted" style="font-size:0.85em">${new Date(c.fechaCreacion).toLocaleString("es-ES")}</div>
                  </div>`
                ).join("");
              }
            });
        }
        cargarComentarios();

        document.getElementById("comentario-form").addEventListener("submit", function(e) {
          e.preventDefault();
          if (!usuario) {
            alert("Debes iniciar sesión para comentar.");
            return;
          }
          const contenido = document.getElementById("comentario-contenido").value.trim();
          if (!contenido) return;
          fetch(`/api/comentarios/noticia/${noticiaId}?autorId=${usuario.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contenido })
          })
          .then(res => {
            if (!res.ok) throw new Error("Error al publicar el comentario");
            return res.json();
          })
          .then(() => {
            document.getElementById("comentario-contenido").value = "";
            cargarComentarios();
          })
          .catch(err => alert(err.message));
        });
      })
      .catch(err => {
        document.getElementById("noticia-detalle").innerHTML = "<p>Error al cargar la noticia.</p>";
        console.error(err);
      });
  } else {
    document.getElementById("noticia-detalle").innerHTML = "<p>ID de noticia no especificado.</p>";
  }
});