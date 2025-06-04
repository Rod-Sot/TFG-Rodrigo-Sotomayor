// --- Variables globales ---
  let foroId = null;
  let foroActual = null;
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  function cargarForo() {
    if (!foroId) {
      document.getElementById("foro-header").innerHTML = "<h3>No se ha especificado el foro.</h3>";
      return;
    }
    fetch(`/api/foros/${foroId}`)
      .then(res => res.ok ? res.json() : Promise.reject("No se pudo cargar el foro"))
      .then(foro => {
        foroActual = foro;
        document.getElementById("foro-header").innerHTML = `
          <h3 class="mb-2">${foro.titulo}</h3>
          <p>
            <strong>Creado por:</strong> ${foro.autor?.nombreUsuario || "Anónimo"} 
            | <strong>Fecha:</strong> ${new Date(foro.fechaCreacion).toLocaleDateString()}
            ${foro.sistemaJuego ? `<span class="badge bg-secondary ms-2">${foro.sistemaJuego.nombre}</span>` : ""}
          </p>
          <p><strong>Respuestas:</strong> ${foro.respuestas || 0} | <strong>Visitas:</strong> ${foro.visitas || 0} | <strong>Categoría:</strong> ${foro.categoria}</p>
        `;
        // Mensaje del autor destacado
        document.getElementById("mensaje-inicial").innerHTML = `
          <div class="message bg-info bg-opacity-25 border-info mb-4" style="position:relative;">
            <span class="badge bg-primary" style="position:absolute; top:10px; right:10px;">Mensaje original</span>
            <div class="message-header">
              <p><strong>${foro.autor?.nombreUsuario || "Anónimo"}</strong> - <small>${new Date(foro.fechaCreacion).toLocaleString("es-ES")}</small></p>
            </div>
            <p class="message-content">${foro.mensajeInicial}</p>
          </div>
        `;
      });
    cargarMensajes();
  }

  function cargarMensajes() {
    fetch(`/api/mensajes-foro/foro/${foroId}`)
      .then(res => res.ok ? res.json() : [])
      .then(mensajes => {
        const cont = document.getElementById("foro-mensajes");
        // Actualiza el contador de respuestas
        const respuestas = mensajes.length;
        const foroHeader = document.getElementById("foro-header");
        if (foroHeader) {
          foroHeader.querySelectorAll("p")[1].innerHTML = `<strong>Respuestas:</strong> ${respuestas} | <strong>Visitas:</strong> ${foroActual?.visitas || 0} | <strong>Categoría:</strong> ${foroActual?.categoria || ''}`;
        }
        if (!mensajes.length) {
          cont.innerHTML = "<div class='text-muted'>No hay respuestas en este foro.</div>";
        } else {
          cont.innerHTML = mensajes.map(m => {
            const puedeBorrar = usuario && m.autor && usuario.id === m.autor.id;
            return `<div class="message">
              <div class="message-header">
                <p><strong>${m.autor?.nombreUsuario || "Anónimo"}</strong> - <small>${new Date(m.fechaCreacion).toLocaleString("es-ES")}</small></p>
                ${puedeBorrar ? `<button class="btn btn-danger btn-sm btn-borrar-mensaje" data-id="${m.id}" title="Borrar mensaje">🗑️</button>` : ""}
              </div>
              <p class="message-content">${m.contenido}</p>
            </div>`;
          }).join("");
        }
        document.querySelectorAll('.btn-borrar-mensaje').forEach(btn => {
          btn.addEventListener('click', function() {
            if (confirm("¿Seguro que quieres borrar este mensaje?")) {
              borrarMensaje(this.getAttribute('data-id'));
            }
          });
        });
        scrollToBottomMensajes();
      });
  }

  function scrollToBottomMensajes() {
    const cont = document.getElementById("foro-mensajes");
    cont.scrollTop = cont.scrollHeight;
  }

  function borrarMensaje(mensajeId) {
    fetch(`/api/mensajes-foro/${mensajeId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo borrar el mensaje");
      cargarForo();
    })
    .catch(err => alert(err.message));
  }

  document.addEventListener("DOMContentLoaded", function() {
    //Login/Logout/Profile
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

    const params = new URLSearchParams(window.location.search);
    if (params.has("foroId")) {
      foroId = params.get("foroId");
    } else {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (!isNaN(Number(lastPart))) {
        foroId = lastPart;
      }
    }
    cargarForo();
    document.getElementById("mensaje-form").addEventListener("submit", function(e) {
      e.preventDefault();
      if (!usuario) {
        alert("Debes iniciar sesión para responder.");
        return;
      }
      const contenido = document.getElementById("mensaje-contenido").value.trim();
      if (!contenido) return;
      fetch('/api/mensajes-foro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foroId: foroId,
          autorId: usuario.id,
          contenido: contenido
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al publicar el mensaje");
        return res.json();
      })
      .then(() => {
        document.getElementById("mensaje-contenido").value = "";
        cargarForo();
      })
      .catch(err => alert(err.message));
    });

    if (!usuario) {
      document.getElementById("mensaje-form").style.display = "none";
    }

    const scrollBtn = document.getElementById("scroll-top-btn");
    const foroMensajes = document.getElementById("foro-mensajes");
    foroMensajes.addEventListener("scroll", function() {
      if (foroMensajes.scrollTop > 100) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    });
    scrollBtn.addEventListener("click", function() {
      foroMensajes.scrollTo({ top: 0, behavior: "smooth" });
    });
  });