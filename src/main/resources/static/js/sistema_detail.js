document.addEventListener("DOMContentLoaded", function() {
    const usuario = localStorage.getItem('usuario');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const perfilBtn = document.getElementById('perfil-btn');

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
            <img src="${s.imagenUrl || '/css/images/dungeons_system.jpg'}" alt="${s.nombre}" class="mb-3 rounded" style="max-width:350px;max-height:220px;">
            <h2 class="text-center">${s.nombre}</h2>
            <button id="btn-follow" class="btn btn-outline-primary btn-sm btn-follow">+ Seguir</button>
            <p class="text-center"><strong>Primera publicación:</strong> ${s.fechaPrimeraPublicacion ? new Date(s.fechaPrimeraPublicacion).toLocaleDateString("es-ES") : '-'}</p>
            <p class="text-center"><strong>Última versión:</strong> ${s.fechaUltimaActualizacion ? new Date(s.fechaUltimaActualizacion).toLocaleDateString("es-ES") : '-'}</p>
            <p class="sistema-description text-center">${s.descripcion || ''}</p>
          `;
          const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
          const btnFollow = document.getElementById('btn-follow');
          if (!usuario) {
            btnFollow.disabled = true;
            btnFollow.textContent = "Inicia sesión para seguir";
            btnFollow.classList.remove("btn-outline-primary");
            btnFollow.classList.add("btn-secondary");
          } else {
            fetch(`/api/sistemas-juego/${sistemaId}/siguiendo?usuarioId=${usuario.id}`)
              .then(res => res.ok ? res.json() : false)
              .then(siguiendo => {
                if (siguiendo) {
                  btnFollow.textContent = "Siguiendo";
                  btnFollow.classList.remove("btn-outline-primary");
                  btnFollow.classList.add("btn-success");
                  btnFollow.disabled = true;
                } else {
                  btnFollow.textContent = "+ Seguir";
                  btnFollow.classList.remove("btn-success");
                  btnFollow.classList.add("btn-outline-primary");
                  btnFollow.disabled = false;
                  btnFollow.addEventListener("click", function() {
                    fetch(`/api/sistemas-juego/${sistemaId}/seguir`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ usuarioId: usuario.id })
                    })
                    .then(res => {
                      if (res.ok) {
                        btnFollow.textContent = "Siguiendo";
                        btnFollow.classList.remove("btn-outline-primary");
                        btnFollow.classList.add("btn-success");
                        btnFollow.disabled = true;
                      } else {
                        alert("No se pudo seguir el sistema.");
                      }
                    });
                  });
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
        })
        .catch(err => {
          detalleDiv.innerHTML = `<div class='alert alert-danger'>${err}</div>`;
        });
    });