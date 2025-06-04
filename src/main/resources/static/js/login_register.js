function toggleSlide() {
      const slider = document.getElementById('formSlider');
      slider.classList.toggle('slide-register');
    }
    // Registro de usuario
    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const nombreUsuario = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: nombreUsuario,
          email: email,
          password: password
        })
      })
      .then(res => {
        if (res.ok) {
          res.json().then(usuario => {
            localStorage.setItem('usuario', JSON.stringify(usuario));
            window.location.href = "/perfil_user";
          });
        } else {
          return res.text().then(msg => { throw new Error(msg); });
        }
      })
      .catch(err => {
        alert('Error al registrar: ' + err.message);
      });
    });
    // Inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
      .then(res => {
        if (res.ok) {
          res.json().then(usuario => {
            localStorage.setItem('usuario', JSON.stringify(usuario));
            window.location.href = "/perfil_user";
          });
        } else {
          return res.text().then(msg => { throw new Error(msg); });
        }
      })
      .catch(err => {
        alert('Error al iniciar sesión: ' + err.message);
      });
    });