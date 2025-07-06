package com.rod.rollenia.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.service.PartidaService;
import com.rod.rollenia.service.UsuarioService;
import com.rod.rollenia.service.NotificacionService;
import com.rod.rollenia.repository.SistemaJuegoRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/partidas")
public class PartidaController {

    private final PartidaService partidaService;
    private final UsuarioService usuarioService;
    private final NotificacionService notificacionService;
    private final SistemaJuegoRepository sistemaJuegoRepository;

    public PartidaController(
        PartidaService partidaService,
        UsuarioService usuarioService,
        NotificacionService notificacionService,
        SistemaJuegoRepository sistemaJuegoRepository
    ) {
        this.partidaService = partidaService;
        this.usuarioService = usuarioService;
        this.notificacionService = notificacionService;
        this.sistemaJuegoRepository = sistemaJuegoRepository;
    }

    @PostMapping
    public ResponseEntity<Partida> crearPartida(@RequestBody Partida partida) {
        partida.setJugadores(new ArrayList<>());
        partida.setJugadoresActuales(0); 
        partida.setFechaCreacion(LocalDate.now());

        if (partida.getSistemaJuego() != null && partida.getSistemaJuego().getId() != null) {
            Optional<SistemaJuego> sistemaOpt = sistemaJuegoRepository.findByIdWithSeguidores(partida.getSistemaJuego().getId());
            sistemaOpt.ifPresent(partida::setSistemaJuego);
        }

        Partida nuevaPartida = partidaService.crearPartida(partida);

        if (nuevaPartida.getSistemaJuego() != null && nuevaPartida.getSistemaJuego().getSeguidores() != null) {
            for (Usuario seguidor : nuevaPartida.getSistemaJuego().getSeguidores()) {
                notificacionService.crearNotificacion(
                    seguidor,
                    "PARTIDA_NUEVA_SISTEMA",
                    "Se ha creado una nueva partida de '" + nuevaPartida.getSistemaJuego().getNombre() + "': " + nuevaPartida.getTitulo(),
                    "/partida_detail?id=" + nuevaPartida.getId()
                );
            }
        }

        return ResponseEntity.ok(nuevaPartida);
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
        partida.setJugadoresActuales(partida.getJugadores().size());
        partidaService.guardar(partida);

        notificacionService.crearNotificacion(
            usuario,
            "PARTIDA_UNIDO",
            "Te has unido a la partida '" + partida.getTitulo() + "'.",
            "/partida_detail?id=" + partida.getId()
        );

        notificacionService.crearNotificacion(
            partida.getCreador(),
            "PARTIDA_NUEVO_JUGADOR",
            usuario.getNombreUsuario() + " se ha unido a tu partida '" + partida.getTitulo() + "'.",
            "/partida_detail?id=" + partida.getId()
        );

        if (partida.getJugadores().size() >= partida.getMaxJugadores()) {
            partida.setEstado("en progreso");
            notificacionService.crearNotificacion(
                partida.getCreador(),
                "PARTIDA_LISTA",
                "¡Tu partida '" + partida.getTitulo() + "' ya está completa y puede comenzar!",
                "/partida_detail?id=" + partida.getId()
            );
            for (Usuario jugador : partida.getJugadores()) {
                notificacionService.crearNotificacion(
                    jugador,
                    "PARTIDA_LISTA",
                    "La partida '" + partida.getTitulo() + "' ya está completa y puede comenzar.",
                    "/partida_detail?id=" + partida.getId()
                );
            }
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarPartida(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<Partida> partidaOpt = partidaService.obtenerPorId(id);
        if (partidaOpt.isEmpty()) return ResponseEntity.notFound().build();
        Partida partida = partidaOpt.get();

        if (!partida.getCreador().getId().equals(usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo el director puede finalizar la partida.");
        }

        partida.setEstado("FINALIZADA"); 
        partidaService.guardar(partida);

        for (Usuario jugador : partida.getJugadores()) {
            notificacionService.crearNotificacion(
                jugador,
                "PARTIDA_FINALIZADA",
                "La partida '" + partida.getTitulo() + "' ha finalizado.",
                "/partida_detail?id=" + partida.getId()
            );
        }
        notificacionService.crearNotificacion(
            partida.getCreador(),
            "PARTIDA_FINALIZADA",
            "Has finalizado la partida '" + partida.getTitulo() + "'.",
            "/partida_detail?id=" + partida.getId()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/partidas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public List<Partida> listarPartidasAdmin() {
        return partidaService.listarPartidas();
    }

    @DeleteMapping("/admin/partidas/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<Void> eliminarPartidaAdmin(@PathVariable Long id) {
        partidaService.eliminarPartida(id);
        return ResponseEntity.noContent().build();
    }
}
