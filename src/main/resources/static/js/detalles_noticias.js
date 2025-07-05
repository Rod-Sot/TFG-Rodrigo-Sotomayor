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
          <img src="img/noticia1.jpg" class="news-image" alt="Imagen noticia">
          <div class="news-title" id="titulo">${noticia.titulo}</div>
          <div class="news-meta">
            Publicado el <span id="fechaPublicacion">${formatearFechaConMesMayus(noticia.fechaPublicacion)}</span>
            por <strong id="autor">${noticia.autor?.nombreUsuario || "Anónimo"}</strong>
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
                    <strong>${c.autor?.nombreUsuario || "Anónimo"}</strong>:
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
const usuarioStr = localStorage.getItem('usuario');
const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
const adminBtnLi = document.getElementById('admin-btn-li');

if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
  adminBtnLi.style.display = "block";
} else {
  adminBtnLi.style.display = "none";
}