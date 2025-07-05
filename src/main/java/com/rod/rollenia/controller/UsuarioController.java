package com.rod.rollenia.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.service.UsuarioService;
import com.rod.rollenia.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.io.IOException;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.Set;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevo = usuarioService.registrarUsuario(usuario);
            nuevo.setPassword(null);
            return ResponseEntity.ok(nuevo);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("El email o el nombre de usuario ya están en uso.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al registrar usuario.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Usuario usuario = usuarioOpt.get();
        usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
        usuario.setEmail(usuarioActualizado.getEmail());
        usuario.setAvatarUrl(usuarioActualizado.getAvatarUrl());

        usuarioService.guardarUsuario(usuario);
        return ResponseEntity.ok(usuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorEmail(loginRequest.getEmail());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
        Usuario usuario = usuarioOpt.get();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (!encoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
        if (usuario.getBaneado()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuario baneado.");
        }
        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol());
        usuario.setPassword(null);
        return ResponseEntity.ok()
            .header("Authorization", "Bearer " + token)
            .body(usuario);
    }

    @GetMapping("/{id}/sistemas-seguidos")
    public ResponseEntity<List<SistemaJuego>> sistemasSeguidos(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<SistemaJuego> sistemas = usuarioOpt.get().getSistemasSeguidos().stream().toList();
        return ResponseEntity.ok(sistemas);
    }

    @PostMapping("/upload-foto")
    public ResponseEntity<String> uploadFoto(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("");
        }
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("src/main/resources/static/uploads/");
        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(filename);
        file.transferTo(filePath);
        return ResponseEntity.ok("/uploads/" + filename);
    }
    @GetMapping("/{id}/partidas/director")
    public ResponseEntity<List<Partida>> partidasComoDirector(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Partida> partidas = usuarioService.obtenerPartidasComoDirector(usuarioOpt.get());
        return ResponseEntity.ok(partidas);
    }
    @GetMapping("/{id}/partidas/jugador")
    public ResponseEntity<List<Partida>> partidasComoJugador(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Partida> partidas = usuarioService.obtenerPartidasComoJugador(usuarioOpt.get());
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/admin/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuariosAdmin() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        usuarios.forEach(u -> u.setPassword(null)); // No exponer contraseñas
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/admin/usuarios/{id}/ascender")
    public ResponseEntity<?> ascenderAAdmin(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.cambiarRol(id, "ADMIN", solicitante);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/usuarios/{id}/revocar")
    public ResponseEntity<?> revocarAdmin(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.cambiarRol(id, "USER", solicitante);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/usuarios/{id}/banear")
    public ResponseEntity<?> banearUsuario(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.banearUsuario(id, solicitante);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/usuarios/{id}/dar-news")
    public ResponseEntity<?> darPermisosNews(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.cambiarRol(id, "USER_NEWS", solicitante);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/usuarios/{id}/quitar-news")
    public ResponseEntity<?> quitarPermisosNews(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.cambiarRol(id, "USER", solicitante);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/usuarios/{id}/desbanear")
    public ResponseEntity<?> desbanearUsuario(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario solicitante = usuarioService.obtenerUsuarioPorEmail(email).orElseThrow();
        usuarioService.desbanearUsuario(id, solicitante);
        return ResponseEntity.ok().build();
    }

    // Obtener amigos del usuario logueado
    @GetMapping("/{id}/amigos")
    public ResponseEntity<Set<Usuario>> obtenerAmigos(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuarioOpt.get().getAmigos());
    }

    @PostMapping("/{id}/amigos/{amigoId}")
    public ResponseEntity<Void> agregarAmigo(@PathVariable Long id, @PathVariable Long amigoId) {
        usuarioService.agregarAmigo(id, amigoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/amigos/{amigoId}")
    public ResponseEntity<Void> eliminarAmigo(@PathVariable Long id, @PathVariable Long amigoId) {
        usuarioService.eliminarAmigo(id, amigoId);
        return ResponseEntity.ok().build();
    }
}
