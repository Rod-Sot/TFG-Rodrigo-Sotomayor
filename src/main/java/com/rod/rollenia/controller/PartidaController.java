package com.rod.rollenia.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.PartidaService;
import com.rod.rollenia.service.UsuarioService;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/partidas")
public class PartidaController {

    private final PartidaService partidaService;
    private final UsuarioService usuarioService;

    public PartidaController(PartidaService partidaService, UsuarioService usuarioService) {
        this.partidaService = partidaService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<Partida> crearPartida(@RequestBody Partida partida) {
        partida.setJugadores(new ArrayList<>());
        partida.setJugadoresActuales(0); 
        partida.setFechaCreacion(LocalDate.now());
        partidaService.crearPartida(partida);
        return ResponseEntity.ok(partida);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partida> obtenerPartidaPorId(@PathVariable Long id) {
        Optional<Partida> partida = partidaService.obtenerPorId(id);
        return partida.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Partida> listarPartidas() {
        return partidaService.listarPartidas();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partida> actualizarPartida(@PathVariable Long id, @RequestBody Partida partidaActualizada) {
        try {
            Partida partida = partidaService.actualizarPartida(id, partidaActualizada);
            return ResponseEntity.ok(partida);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPartida(@PathVariable Long id) {
        try {
            partidaService.eliminarPartida(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/unirse")
    public ResponseEntity<?> unirseAPartida(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<Partida> partidaOpt = partidaService.obtenerPorId(id);
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(usuarioId);
        if (partidaOpt.isEmpty() || usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Partida partida = partidaOpt.get();
        Usuario usuario = usuarioOpt.get();
        if (partida.getCreador().getId().equals(usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("El director no puede unirse como jugador.");
        }
        if (partida.getJugadores().size() >= partida.getMaxJugadores()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("La partida está completa.");
        }
        if (partida.getJugadores().contains(usuario)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya estás unido a la partida.");
        }
        partida.getJugadores().add(usuario);
        partidaService.guardar(partida);
        return ResponseEntity.ok().build();
    }
}
