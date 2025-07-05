document.addEventListener('DOMContentLoaded', () => {
    // Login/logout/perfil
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

    // Cargar sistemas desde el backend
    fetch('/api/sistemas-juego')
      .then(res => res.ok ? res.json() : [])
      .then(sistemas => {
        const inner = document.getElementById('carousel-sistemas-inner');
        if (!sistemas.length) {
          inner.innerHTML = "<div class='text-center text-muted p-5'>No hay sistemas disponibles.</div>";
          return;
        }
        inner.innerHTML = sistemas.map((s, idx) => `
          <div class="carousel-item${idx === 0 ? ' active' : ''}">
            <a href="/sistema_detail?sistemaId=${s.id}" class="sistema-card text-decoration-none text-dark">
              <img src="${s.imagenUrl || '/css/images/dungeons_system.jpg'}" class="d-block w-100" alt="${s.nombre}">
              <div class="carousel-caption d-none d-md-block">
                <h5>${s.nombre}</h5>
                <p>${s.descripcion}</p>
              </div>
            </a>
          </div>
        `).join('');
        actualizarIndicador();
      });

    // Indicador de posición del carrusel
    const carousel = document.querySelector('#sistemasCarousel');
    const current = document.getElementById('indicator-current');
    const prev = document.getElementById('indicator-prev');
    const next = document.getElementById('indicator-next');

    function actualizarIndicador() {
      const items = document.querySelectorAll('#sistemasCarousel .carousel-item');
      const totalItems = items.length;
      const activeIndex = [...items].findIndex(item => item.classList.contains('active')) + 1;
      current.textContent = activeIndex;
      prev.classList.toggle('d-none', activeIndex === 1);
      next.classList.toggle('d-none', activeIndex === totalItems);
    }
    setTimeout(actualizarIndicador, 500);
    carousel.addEventListener('slid.bs.carousel', actualizarIndicador);
    const usuarioStr = localStorage.getItem('usuario');
    const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
    const adminBtnLi = document.getElementById('admin-btn-li');

    if (usuarioObj && (usuarioObj.rol === "ADMIN" || usuarioObj.rol === "OWNER")) {
      adminBtnLi.style.display = "block";
    } else {
      adminBtnLi.style.display = "none";
    }
  });