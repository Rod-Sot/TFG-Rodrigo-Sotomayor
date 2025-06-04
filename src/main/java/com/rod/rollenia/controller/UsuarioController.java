package com.rod.rollenia.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.io.IOException;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
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
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        if (!encoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
        usuario.setPassword(null);
        return ResponseEntity.ok(usuario);
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
}
