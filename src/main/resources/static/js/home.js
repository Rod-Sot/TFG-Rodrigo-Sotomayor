document.addEventListener("DOMContentLoaded", function() {
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const adminBtnLi = document.getElementById('admin-btn-li');
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

    if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
      adminBtnLi.style.display = "block";
    } else {
      adminBtnLi.style.display = "none";
    }

    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem('usuario');
      window.location.href = "/home";
    });
  });