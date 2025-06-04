package com.rod.rollenia.service;

import java.util.Optional;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
        // Cifrar la contraseña
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        usuario.setPassword(encoder.encode(usuario.getPassword()));
        usuario.setFechaRegistro(java.time.LocalDate.now());
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
}

