let todasNoticias = [];
const token = localStorage.getItem('token');

document.addEventListener("DOMContentLoaded", () => {
  
  cargarNoticias();
  // Filtros
  document.getElementById('filtroFecha').addEventListener('input', aplicarFiltros);
  document.getElementById('filtroSistema').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroTitulo').addEventListener('input', aplicarFiltros);
  // Crear noticia
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
    const tarjeta = document.createElement("a");
    tarjeta.href = `detalles_noticias/${noticia.id}`;
    tarjeta.className = "news-card";
    tarjeta.innerHTML = `
      <img src="${noticia.miniaturaUrl || 'img/placeholder.jpg'}" class="news-thumbnail" alt="Miniatura">
      <div class="news-info">
        <div class="news-title">${noticia.titulo}</div>
        <div class="news-date">${formatearFecha(noticia.fechaPublicacion)}</div>
        <div class="news-summary">${noticia.contenido.substring(0, 120)}...</div>
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
  const usuario = localStorage.getItem('usuario');
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
});

document.addEventListener("DOMContentLoaded", function() {
  // Cargar sistemas de juego en filtro y modal
  fetch('/api/sistemas-juego')
    .then(res => res.ok ? res.json() : [])
    .then(sistemas => {
      // Filtro
      const filtroSelect = document.getElementById('filtroSistema');
      if (filtroSelect) {
        // Elimina opciones antiguas salvo la primera
        filtroSelect.innerHTML = '<option value="">Todos los sistemas</option>';
        sistemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nombre;
          filtroSelect.appendChild(opt);
        });
      }
      // Modal
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
const usuarioStr = localStorage.getItem('usuario');
const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
const adminBtnLi = document.getElementById('admin-btn-li');

if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
  adminBtnLi.style.display = "block";
} else {
  adminBtnLi.style.display = "none";
}