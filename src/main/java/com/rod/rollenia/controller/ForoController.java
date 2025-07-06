package com.rod.rollenia.controller;

import com.rod.rollenia.entity.Foro;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.ForoRepository;
import com.rod.rollenia.repository.SistemaJuegoRepository;
import com.rod.rollenia.repository.UsuarioRepository;
import com.rod.rollenia.service.ForoService;
import com.rod.rollenia.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/foros")
public class ForoController {

    private final ForoService foroService;
    private final SistemaJuegoRepository sistemaJuegoRepository;
    private final ForoRepository foroRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    public ForoController(
            ForoService foroService,
            SistemaJuegoRepository sistemaJuegoRepository,
            ForoRepository foroRepository,
            UsuarioRepository usuarioRepository,
            NotificacionService notificacionService
    ) {
        this.foroService = foroService;
        this.sistemaJuegoRepository = sistemaJuegoRepository;
        this.foroRepository = foroRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public List<Foro> listarForos() {
        return foroService.listarForos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Foro> obtenerForoPorId(@PathVariable Long id) {
        Optional<Foro> foro = foroService.obtenerForoPorId(id);
        return foro.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Foro> crearForo(
            @RequestBody Foro foro,
            @RequestParam(required = false) Long sistemaJuegoId,
            @RequestParam(required = false) Long autorId) {

        if (sistemaJuegoId != null) {
            Optional<SistemaJuego> sistemaOpt = sistemaJuegoRepository.findById(sistemaJuegoId);
            sistemaOpt.ifPresent(foro::setSistemaJuego);
        }

        if (autorId != null) {
            Optional<Usuario> autorOpt = usuarioRepository.findById(autorId);
            if (autorOpt.isPresent()) {
                foro.setAutor(autorOpt.get());
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.badRequest().build();
        }

        if (foro.getFechaCreacion() == null) {
            foro.setFechaCreacion(LocalDateTime.now());
        }

        foroRepository.save(foro);

        // Notificar a los seguidores
        if (foro.getSistemaJuego() != null && foro.getSistemaJuego().getSeguidores() != null) {
            for (Usuario seguidor : foro.getSistemaJuego().getSeguidores()) {
                notificacionService.crearNotificacion(
                    seguidor,
                    "FORO_NUEVO_SISTEMA",
                    "Se ha creado un nuevo foro sobre '" + foro.getSistemaJuego().getNombre() + "': " + foro.getTitulo(),
                    "/foro_detail?id=" + foro.getId()
                );
            }
        }

        return ResponseEntity.ok(foro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarForo(@PathVariable Long id) {
        foroService.eliminarForo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/foros")
    public List<Foro> listarForosAdmin() {
        return foroService.listarForos();
    }

    @DeleteMapping("/admin/foros/{id}")
    public ResponseEntity<Void> eliminarForoAdmin(@PathVariable Long id) {
        foroService.eliminarForo(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/sumar-visita")
    public ResponseEntity<Void> sumarVisita(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        foroService.sumarVisita(id);
        return ResponseEntity.ok().build();
    }
}
