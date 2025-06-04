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
    // Si no hay usuario, redirige a login
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

  // Si tienes el id, puedes obtener datos actualizados del backend:
  if (usuario.id) {
    fetch(`/api/usuarios/${usuario.id}`)
      .then(res => res.ok ? res.json() : usuario) // Si falla, usa el local
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
                <a href="/detalles_partida?partidaId=${p.id}" class="text-decoration-none">${p.nombre}</a>
                <span class="badge bg-secondary">${p.sistema || ''}</span>
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
  const modalEditarPerfil = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
  // Abrir modal al pulsar "Editar perfil"
  document.querySelector('.btn-outline-primary.btn-sm').addEventListener('click', function() {
    document.getElementById('input-nombre').value = usuario.nombreUsuario;
    document.getElementById('input-email').value = usuario.email;
    document.getElementById('input-foto').value = usuario.avatarUrl || '';
    modalEditarPerfil.show();
  });

  // Guardar cambios
  document.getElementById('form-editar-perfil').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('input-foto');
    const file = fileInput.files[0];

    function actualizarPerfil(avatarUrl) {
      fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: document.getElementById('input-nombre').value,
          email: document.getElementById('input-email').value,
          avatarUrl: avatarUrl // la ruta de la imagen subida
        })
      })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(usuarioActualizado => {
        document.getElementById('nombre-usuario').textContent = usuarioActualizado.nombreUsuario;
        document.getElementById('email-usuario').textContent = "Email: " + usuarioActualizado.email;
        document.getElementById('profile-avatar').src = usuarioActualizado.avatarUrl || '/css/images/default_avatar.png';
        modalEditarPerfil.hide();
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
  });
});