package com.rod.rollenia.service;

import java.util.Optional;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.UsuarioRepository;
import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.repository.PartidaRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PartidaRepository partidaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, PartidaRepository partidaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.partidaRepository = partidaRepository;
    }

    public Usuario crearUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso.");
        }
        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso.");
        }
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario actualizarUsuario(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
            usuario.setEmail(usuarioActualizado.getEmail());
            usuario.setAvatarUrl(usuarioActualizado.getAvatarUrl());
            usuario.setPassword(usuarioActualizado.getPassword());
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado.");
        }
        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre de usuario ya está registrado.");
        }
        // Cifrar la contraseña
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        usuario.setPassword(encoder.encode(usuario.getPassword()));
        usuario.setFechaRegistro(java.time.LocalDate.now());
        // USER by default
        if (usuario.getRol() == null) {
            usuario.setRol("USER");
        }
        if (usuario.getBiografia() == null || usuario.getBiografia().isBlank()) {
            usuario.setBiografia("Escribe aquí tu biografía...");
        }
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public boolean usuarioSigueSistema(Long usuarioId, Long sistemaId) {
        return usuarioRepository.findById(usuarioId)
            .map(usuario -> usuario.getSistemasSeguidos()
                .stream()
                .anyMatch(s -> s.getId().equals(sistemaId)))
            .orElse(false);
    }

    public List<Partida> obtenerPartidasComoDirector(Usuario usuario) {
        return partidaRepository.findByCreador(usuario);
    }

    public List<Partida> obtenerPartidasComoJugador(Usuario usuario) {
        return partidaRepository.findByJugadoresContaining(usuario);
    }

    // Cambiar el rol de un usuario
    public void cambiarRol(Long id, String nuevoRol, Usuario solicitante) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

        // No permitir modificar al OWNER
        if ("OWNER".equals(usuario.getRol())) {
            throw new IllegalStateException("No se puede modificar al OWNER.");
        }

        // Solo OWNER puede ascender/revocar admins
        if (!"OWNER".equals(solicitante.getRol())) {
            throw new SecurityException("Solo el OWNER puede cambiar roles de admin.");
        }

        // Solo puede haber un OWNER
        if ("OWNER".equalsIgnoreCase(nuevoRol) && usuarioRepository.existsByRol("OWNER")) {
            throw new IllegalStateException("Ya existe un usuario OWNER.");
        }

        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);
    }

    // Banear usuario
    public void banearUsuario(Long id, Usuario solicitante) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        if ("OWNER".equals(usuario.getRol())) {
            throw new IllegalStateException("No se puede banear al OWNER.");
        }
        // Solo OWNER o ADMIN pueden banear, pero no a OWNER ni a otros ADMIN si no eres OWNER
        if ("ADMIN".equals(usuario.getRol()) && !"OWNER".equals(solicitante.getRol())) {
            throw new SecurityException("Solo el OWNER puede banear a un ADMIN.");
        }
        usuario.setBaneado(true);
        usuarioRepository.save(usuario);
    }
    public void desbanearUsuario(Long id, Usuario solicitante) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        if ("OWNER".equals(usuario.getRol())) {
            throw new IllegalStateException("No se puede modificar al OWNER.");
        }
        // Solo OWNER o ADMIN pueden desbanear, pero no a OWNER ni a otros ADMIN si no eres OWNER
        if ("ADMIN".equals(usuario.getRol()) && !"OWNER".equals(solicitante.getRol())) {
            throw new SecurityException("Solo el OWNER puede desbanear a un ADMIN.");
        }
        usuario.setBaneado(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void agregarAmigo(Long usuarioId, Long amigoId) {
        if (usuarioId.equals(amigoId)) throw new IllegalArgumentException("No puedes agregarte a ti mismo como amigo.");
        Usuario usuario = obtenerUsuarioPorId(usuarioId).orElseThrow();
        Usuario amigo = obtenerUsuarioPorId(amigoId).orElseThrow();
        // Comprobar si ya son amigos
        if (usuario.getAmigos().contains(amigo)) {
            return;
        }
        usuario.getAmigos().add(amigo);
        amigo.getAmigos().add(usuario);
        guardarUsuario(usuario);
        guardarUsuario(amigo);
    }

    @Transactional
    public void eliminarAmigo(Long usuarioId, Long amigoId) {
        Usuario usuario = obtenerUsuarioPorId(usuarioId).orElseThrow();
        Usuario amigo = obtenerUsuarioPorId(amigoId).orElseThrow();
        usuario.getAmigos().remove(amigo);
        amigo.getAmigos().remove(usuario);
        guardarUsuario(usuario);
        guardarUsuario(amigo);
    }
}

