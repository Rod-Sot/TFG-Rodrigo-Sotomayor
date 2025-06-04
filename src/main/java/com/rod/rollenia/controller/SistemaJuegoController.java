package com.rod.rollenia.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.service.SistemaJuegoService;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.UsuarioService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sistemas-juego")
public class SistemaJuegoController {

    private final SistemaJuegoService sistemaJuegoService;
    private final UsuarioService usuarioService;

    public SistemaJuegoController(SistemaJuegoService sistemaJuegoService, UsuarioService usuarioService) {
        this.sistemaJuegoService = sistemaJuegoService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<SistemaJuego> crearSistemaJuego(@RequestBody SistemaJuego sistemaJuego) {
        SistemaJuego nuevoSistema = sistemaJuegoService.crearSistemaJuego(sistemaJuego);
        return new ResponseEntity<>(nuevoSistema, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SistemaJuego> obtenerSistemaJuegoPorId(@PathVariable Long id) {
        Optional<SistemaJuego> sistemaJuego = sistemaJuegoService.obtenerSistemaJuegoPorId(id);
        return sistemaJuego.map(ResponseEntity::ok)
                           .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<SistemaJuego> listarSistemasJuego() {
        return sistemaJuegoService.listarSistemasJuego();
    }

    @PutMapping("/{id}")
    public ResponseEntity<SistemaJuego> actualizarSistemaJuego(@PathVariable Long id, @RequestBody SistemaJuego sistemaJuegoActualizado) {
        try {
            SistemaJuego sistemaJuego = sistemaJuegoService.actualizarSistemaJuego(id, sistemaJuegoActualizado);
            return ResponseEntity.ok(sistemaJuego);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSistemaJuego(@PathVariable Long id) {
        try {
            sistemaJuegoService.eliminarSistemaJuego(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/{id}/seguir")
    public ResponseEntity<?> seguirSistema(@PathVariable Long id, @RequestBody SeguirRequest request) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(request.getUsuarioId());
        Optional<SistemaJuego> sistemaOpt = sistemaJuegoService.obtenerSistemaJuegoPorId(id);

        if (usuarioOpt.isEmpty() || sistemaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioOpt.get();
        SistemaJuego sistema = sistemaOpt.get();

        usuario.getSistemasSeguidos().add(sistema);
        usuarioService.guardarUsuario(usuario);

        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}/siguiendo")
    public ResponseEntity<Boolean> estaSiguiendo(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(usuarioId);
        if (usuarioOpt.isEmpty()) return ResponseEntity.ok(false);

        boolean siguiendo = usuarioOpt.get().getSistemasSeguidos()
            .stream().anyMatch(s -> s.getId().equals(id));
        return ResponseEntity.ok(siguiendo);
    }
    public static class SeguirRequest {
        private Long usuarioId;
        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    }
}
