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

    // --- MENSAJES ---
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

    // --- NOTIFICACIONES ---
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

    // --- LÓGICA DE SISTEMA DETAIL ---
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

    function getSistemaId() {
      const params = new URLSearchParams(window.location.search);
      return params.get("sistemaId");
    }

    const sistemaId = getSistemaId();
    const detalleDiv = document.getElementById('sistema-detalle');
    const docsDiv = document.getElementById('documentos-relacionados');
    const noticiasDiv = document.getElementById('noticias-relacionadas');

    if (!sistemaId) {
      detalleDiv.innerHTML = "<div class='alert alert-danger'>No se ha especificado el sistema.</div>";
      return;
    }

    fetch(`/api/sistemas-juego/${sistemaId}`)
      .then(res => res.ok ? res.json() : Promise.reject("No se pudo cargar el sistema"))
      .then(s => {
        detalleDiv.innerHTML = `
          <div class="text-center">
            <img id="sistema-img" src="${s.imagenUrl || '/css/images/dungeons_system.jpg'}" alt="${s.nombre}" class="mb-3 rounded" style="max-width:350px;max-height:220px;">
          </div>
          <h2 class="text-center" id="sistema-nombre">${s.nombre}</h2>
          <button id="btn-follow" class="btn btn-outline-primary btn-sm btn-follow">+ Seguir</button>
          <p class="text-center"><strong>Primera publicación:</strong> <span id="sistema-fecha-primera">${s.fechaPrimeraPublicacion ? new Date(s.fechaPrimeraPublicacion).toLocaleDateString("es-ES") : '-'}</span></p>
          <p class="text-center"><strong>Última versión:</strong> <span id="sistema-fecha-ultima">${s.fechaUltimaActualizacion ? new Date(s.fechaUltimaActualizacion).toLocaleDateString("es-ES") : '-'}</span></p>
          <p class="sistema-description text-center" id="sistema-descripcion">${s.descripcion || ''}</p>
          <div id="sistema-documentos" class="mb-3">
            <h4>Documentos oficiales</h4>
            <div id="documentos-list">
              ${(s.documentos || []).map(d => `
                <div class="documento-item">
                  📄 <span class="doc-titulo">${d.titulo}</span> - 
                  <a href="${d.url}" target="_blank" class="doc-url">${d.tipo === 'PDF' ? 'Descargar' : 'Ver'}</a>
                  <span class="doc-tipo d-none">${d.tipo}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="text-center">
            <button id="btn-editar-sistema" class="btn btn-warning my-2 d-none">Editar sistema</button>
            <button id="btn-aceptar-edicion" class="btn btn-success my-2 d-none">Aceptar cambios</button>
            <button id="btn-cancelar-edicion" class="btn btn-secondary my-2 d-none">Cancelar</button>
          </div>
        `;
        const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
        const btnFollow = document.getElementById('btn-follow');
        if (!usuario) {
          btnFollow.disabled = true;
          btnFollow.textContent = "Inicia sesión para seguir";
          btnFollow.classList.remove("btn-outline-primary", "btn-success");
          btnFollow.classList.add("btn-secondary");
        } else {
          fetch(`/api/sistemas-juego/${sistemaId}/siguiendo?usuarioId=${usuario.id}`)
            .then(res => res.ok ? res.json() : false)
            .then(siguiendo => {
              actualizarBotonSeguir(siguiendo);

              btnFollow.onclick = function() {
                if (btnFollow.dataset.siguiendo === "true") {
                  // Dejar de seguir
                  fetch(`/api/sistemas-juego/${sistemaId}/dejar-seguir`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuarioId: usuario.id })
                  })
                  .then(res => {
                    if (res.ok) {
                      actualizarBotonSeguir(false);
                    } else {
                      alert("No se pudo dejar de seguir el sistema.");
                    }
                  });
                } else {
                  // Seguir
                  fetch(`/api/sistemas-juego/${sistemaId}/seguir`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuarioId: usuario.id })
                  })
                  .then(res => {
                    if (res.ok) {
                      actualizarBotonSeguir(true);
                    } else {
                      alert("No se pudo seguir el sistema.");
                    }
                  });
                }
              };

              function actualizarBotonSeguir(siguiendo) {
                btnFollow.dataset.siguiendo = siguiendo ? "true" : "false";
                if (siguiendo) {
                  btnFollow.textContent = "Dejar de seguir";
                  btnFollow.classList.remove("btn-outline-primary");
                  btnFollow.classList.add("btn-success");
                  btnFollow.classList.remove("btn-secondary");
                  btnFollow.disabled = false;
                } else {
                  btnFollow.textContent = "+ Seguir";
                  btnFollow.classList.remove("btn-success");
                  btnFollow.classList.add("btn-outline-primary");
                  btnFollow.classList.remove("btn-secondary");
                  btnFollow.disabled = false;
                }
              }
            });
        }
        if (s.documentos && s.documentos.length) {
          docsDiv.classList.remove('d-none');
          docsDiv.innerHTML = `<h4>Documentos oficiales</h4>` +
            s.documentos.map(d => `
              <div class="documento-item">
                📄 ${d.titulo} - <a href="${d.url}" target="_blank">${d.tipo === 'PDF' ? 'Descargar' : 'Ver'}</a>
              </div>
            `).join('');
        }
        if (s.noticiasRelacionadas && s.noticiasRelacionadas.length) {
          noticiasDiv.classList.remove('d-none');
          noticiasDiv.innerHTML = `<h4>Noticias relacionadas</h4>` +
            s.noticiasRelacionadas.map(n => `
              <div class="noticia-item">
                <a href="/detalles_noticias/${n.id}">${n.titulo}</a>
              </div>
            `).join('');
        }

        const btnEditar = document.getElementById('btn-editar-sistema');
        const btnAceptar = document.getElementById('btn-aceptar-edicion');
        const btnCancelar = document.getElementById('btn-cancelar-edicion');

        if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
          btnEditar.classList.remove('d-none');
        }

        let editMode = false;
        let backup = {};

        btnEditar.onclick = function() {
          editMode = true;
          btnEditar.classList.add('d-none');
          btnAceptar.classList.remove('d-none');
          btnCancelar.classList.remove('d-none');

          // Backup valores originales
          backup = {
            imagenUrl: document.getElementById('sistema-img').src,
            fechaUltima: document.getElementById('sistema-fecha-ultima').textContent,
            descripcion: document.getElementById('sistema-descripcion').textContent,
            documentos: Array.from(document.querySelectorAll('#documentos-list .documento-item')).map(div => ({
              titulo: div.querySelector('.doc-titulo').textContent,
              url: div.querySelector('a').href,
              tipo: div.querySelector('.doc-tipo').textContent
            }))
          };

          // Imagen (inline editable con lápiz)
          const img = document.getElementById('sistema-img');
          img.outerHTML = `
            <div class="position-relative d-inline-block mb-2" style="max-width:350px;">
              <img id="edit-imagen-preview" src="${s.imagenUrl || '/css/images/dungeons_system.jpg'}" alt="${s.nombre}" class="mb-3 rounded" style="max-width:350px;max-height:220px;">
              <span id="edit-imagen-pencil" title="Cambiar imagen" style="position:absolute;bottom:10px;right:10px;cursor:pointer;font-size:2rem;z-index:2;">🖉</span>
              <input type="file" id="edit-imagen-file" accept="image/*" style="display:none">
            </div>
          `;

          // Lógica para el lápiz y la previsualización
          setTimeout(() => {
            const pencil = document.getElementById('edit-imagen-pencil');
            const fileInput = document.getElementById('edit-imagen-file');
            const preview = document.getElementById('edit-imagen-preview');
            let nuevaImagenBase64 = null;

            pencil.onclick = () => fileInput.click();

            fileInput.onchange = function() {
              const file = fileInput.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  preview.src = e.target.result;
                  nuevaImagenBase64 = e.target.result; // Guardamos la imagen en base64 para enviar al backend
                };
                reader.readAsDataURL(file);
              }
            };

            // Guardar la referencia para usarla en btnAceptar.onclick
            btnAceptar.nuevaImagenBase64 = () => nuevaImagenBase64;
          }, 0);

          // Fecha última publicación
          const fechaUltima = document.getElementById('sistema-fecha-ultima');
          const fechaValue = s.fechaUltimaActualizacion ? new Date(s.fechaUltimaActualizacion).toISOString().slice(0,10) : '';
          fechaUltima.outerHTML = `<input type="date" id="edit-fecha-ultima" class="form-control d-inline-block" style="width:180px" value="${fechaValue}">`;

          // Descripción
          const desc = document.getElementById('sistema-descripcion');
          desc.outerHTML = `<textarea id="edit-descripcion" class="form-control mb-2" rows="3">${s.descripcion || ''}</textarea>`;

          // Documentos
          const docsDiv = document.getElementById('documentos-list');
          docsDiv.innerHTML = `
            <textarea id="edit-documentos" class="form-control" rows="3">${
              (s.documentos || []).map(d => `${d.titulo}|${d.url}|${d.tipo}`).join('\n')
            }</textarea>
            <small class="text-muted">Uno por línea, formato: título|url|tipo</small>
          `;
        };

        btnCancelar.onclick = function() {
          // Restaurar vista original
          location.reload();
        };

        btnAceptar.onclick = function() {
          // Recoger valores editados
          let imagenUrl = s.imagenUrl;
          const nuevaImagenBase64 = btnAceptar.nuevaImagenBase64 && btnAceptar.nuevaImagenBase64();
          if (nuevaImagenBase64) {
            imagenUrl = nuevaImagenBase64; // Enviar base64 al backend
          }
          const fechaUltima = document.getElementById('edit-fecha-ultima').value;
          const descripcion = document.getElementById('edit-descripcion').value.trim();
          const docs = document.getElementById('edit-documentos').value.trim()
            ? document.getElementById('edit-documentos').value.trim().split('\n').map(line => {
                const [titulo, url, tipo] = line.split('|');
                return { titulo: titulo?.trim(), url: url?.trim(), tipo: tipo?.trim() };
              })
            : [];

          const actualizado = {
            imagenUrl,
            fechaUltimaActualizacion: fechaUltima ? new Date(fechaUltima).toISOString() : null,
            descripcion,
            documentos: docs
          };

          fetch(`/api/sistemas-juego/admin/sistemas/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...s, ...actualizado })
          })
          .then(res => {
            if (res.ok) {
              location.reload();
            } else {
              alert("Error al actualizar el sistema.");
            }
          });
        };
      })
      .catch(err => {
        detalleDiv.innerHTML = `<div class='alert alert-danger'>${err}</div>`;
      });
  });