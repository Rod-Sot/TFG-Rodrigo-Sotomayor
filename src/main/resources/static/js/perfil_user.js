document.addEventListener("DOMContentLoaded", function() {
  // Cerrar sesión
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('usuario');
    window.location.href = "/home";
  });

  // Recupera el usuario del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) {
    // Sin usuario, redirige a login
    window.location.href = "/login";
    return;
  }
  let usuario = {};
  try {
    usuario = JSON.parse(usuarioStr);
  } catch {
    window.location.href = "/login";
    return;
  }

  if (usuario.id) {
    fetch(`/api/usuarios/${usuario.id}`)
      .then(res => res.ok ? res.json() : usuario) 
      .then(datos => {
        usuario = datos;
        cargarPerfil(usuario);
      })
      .catch(() => cargarPerfil(usuario));
  } else {
    cargarPerfil(usuario);
  }
  function cargarPerfil(usuario) {
    document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario || 'Usuario';
    document.getElementById('email-usuario').textContent = 'Email: ' + (usuario.email || '');
    document.getElementById('profile-avatar').src = usuario.avatarUrl || 'standard_pfp.png';
    document.getElementById('biografia-usuario').textContent = usuario.biografia || 'Escribe aquí tu biografía...';
    if (usuario.id) {
      // Partidas como jugador
      fetch(`/api/usuarios/${usuario.id}/partidas/jugador`)
        .then(res => res.ok ? res.json() : [])
        .then(partidas => {
          const ul = document.getElementById('partidas-jugador');
          if (partidas.length === 0) {
            ul.innerHTML = "<li class='list-group-item text-muted'>No hay partidas como jugador.</li>";
          } else {
            ul.innerHTML = partidas.map(p =>
              `<li class="list-group-item d-flex justify-content-between align-items-center">
                <a href="/partida_detail?partidaId=${p.id}" class="text-decoration-none">${p.titulo}</a>
                <span class="badge bg-secondary">${p.sistemaJuego.nombre || ''}</span>
              </li>`
            ).join('');
          }
        });

      // Partidas como director
      fetch(`/api/usuarios/${usuario.id}/partidas/director`)
        .then(res => res.ok ? res.json() : [])
        .then(partidas => {
          const ul = document.getElementById('partidas-director');
          if (partidas.length === 0) {
            ul.innerHTML = "<li class='list-group-item text-muted'>No hay partidas como director.</li>";
          } else {
            ul.innerHTML = partidas.map(p =>
              `<li class="list-group-item d-flex justify-content-between align-items-center">
                <a href="/partida_detail?partidaId=${p.id}" class="text-decoration-none">${p.titulo}</a>
                <span class="badge bg-secondary">${p.sistemaJuego.nombre || ''}</span>
              </li>`
            ).join('');
          }
        });
    }

    // Sistemas seguidos
    const divSistemas = document.getElementById('sistemas-seguidos');
    if (usuario.id) {
      fetch(`/api/usuarios/${usuario.id}/sistemas-seguidos`)
        .then(res => res.ok ? res.json() : [])
        .then(sistemas => {
          if (!sistemas.length) {
            divSistemas.innerHTML = "<span class='text-muted'>No sigues ningún sistema.</span>";
          } else {
            divSistemas.innerHTML = sistemas.map(s =>
              `<a href="/sistema_detail?sistemaId=${s.id}" class="badge bg-primary me-2 mb-2 text-decoration-none text-light">${s.nombre}</a>`
            ).join('');
          }
        });
    }
  }

  
  const adminBtnLi = document.getElementById('admin-btn-li');

  if (usuario && (usuario.rol === "ADMIN" || usuario.rol === "OWNER")) {
    adminBtnLi.style.display = "block";
  } else {
    adminBtnLi.style.display = "none";
  }

  function activarEdicionPerfil(usuario) {
    // Nombre de usuario
    const nombreTd = document.getElementById('nombre-usuario');
    nombreTd.innerHTML = `<input type="text" class="form-control" id="input-nombre" value="${usuario.nombreUsuario}">`;

    // Email
    const emailTd = document.getElementById('email-usuario');
    emailTd.innerHTML = `<input type="email" class="form-control" id="input-email" value="${usuario.email}">`;

    // Biografía
    const bioTd = document.getElementById('biografia-usuario');
    bioTd.innerHTML = `<textarea class="form-control" id="input-biografia" rows="3">${usuario.biografia || ''}</textarea>`;

    // Mostrar icono de editar y de reset
    document.getElementById('edit-avatar-icon').style.display = "block";
    document.getElementById('reset-avatar-icon').style.display = "block";

    // Botones
    document.getElementById('btn-editar-perfil').style.display = 'none';
    if (!document.getElementById('btn-guardar-perfil')) {
      const guardarBtn = document.createElement('button');
      guardarBtn.id = 'btn-guardar-perfil';
      guardarBtn.className = 'btn btn-success btn-sm me-2';
      guardarBtn.textContent = 'Guardar';
      guardarBtn.onclick = guardarCambiosPerfil;

      const cancelarBtn = document.createElement('button');
      cancelarBtn.id = 'btn-cancelar-perfil';
      cancelarBtn.className = 'btn btn-secondary btn-sm';
      cancelarBtn.textContent = 'Cancelar';
      cancelarBtn.onclick = () => location.reload();

      nombreTd.parentElement.appendChild(guardarBtn);
      nombreTd.parentElement.appendChild(cancelarBtn);
    }
  }

  // Foto de perfil click => input file
  document.getElementById('avatar-container').addEventListener('click', function(e) {
    if (document.getElementById('edit-avatar-icon').style.display === "block") {
      document.getElementById('input-foto').click();
    }
  });

  // Previsualizar imagen
  document.getElementById('input-foto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        document.getElementById('profile-avatar').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  function guardarCambiosPerfil() {
    const nombre = document.getElementById('input-nombre').value;
    const email = document.getElementById('input-email').value;
    const biografia = document.getElementById('input-biografia').value;
    const fileInput = document.getElementById('input-foto');
    const file = fileInput.files[0];

    function actualizarPerfil(avatarUrl) {
      if (document.getElementById('profile-avatar').src.includes('standard_pfp.png')) {
        avatarUrl = 'standard_pfp.png';
      }

      fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: nombre,
          email: email,
          biografia: biografia,
          avatarUrl: avatarUrl
        })
      })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(usuarioActualizado => {
        location.reload();
      })
      .catch(() => alert('Error al actualizar el perfil'));
    }

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      fetch('/api/usuarios/upload-foto', {
        method: 'POST',
        body: formData
      })
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(avatarUrl => {
        actualizarPerfil(avatarUrl);
      })
      .catch(() => alert('Error al subir la imagen'));
    } else {
      actualizarPerfil(usuario.avatarUrl || '');
    }
  }

  document.getElementById('btn-editar-perfil').addEventListener('click', function() {
    activarEdicionPerfil(usuario);
  });

  document.getElementById('reset-avatar-icon').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('profile-avatar').src = 'standard_pfp.png';
    document.getElementById('input-foto').value = '';
  });
});