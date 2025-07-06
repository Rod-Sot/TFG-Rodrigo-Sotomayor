package com.rod.rollenia.controller;

import com.rod.rollenia.entity.SolicitudAmistad;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.SolicitudAmistadService;
import com.rod.rollenia.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/solicitudes-amistad")
public class SolicitudAmistadController {

    private final SolicitudAmistadService solicitudService;
    private final UsuarioService usuarioService;

    public SolicitudAmistadController(SolicitudAmistadService solicitudService, UsuarioService usuarioService) {
        this.solicitudService = solicitudService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarSolicitud(@RequestParam Long emisorId, @RequestParam Long receptorId) {
        Optional<Usuario> emisorOpt = usuarioService.obtenerUsuarioPorId(emisorId);
        Optional<Usuario> receptorOpt = usuarioService.obtenerUsuarioPorId(receptorId);
        if (emisorOpt.isEmpty() || receptorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado.");
        }
        SolicitudAmistad solicitud = solicitudService.enviarSolicitud(emisorOpt.get(), receptorOpt.get());
        return ResponseEntity.ok(solicitud);
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<?> aceptarSolicitud(@PathVariable Long id) {
        Optional<SolicitudAmistad> solicitudOpt = solicitudService.obtenerSolicitudPorId(id);
        if (solicitudOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SolicitudAmistad solicitud = solicitudOpt.get();
        solicitud.setEstado(SolicitudAmistad.EstadoSolicitud.ACEPTADA);

        Usuario emisor = solicitud.getUsuarioEmisor();
        Usuario receptor = solicitud.getUsuarioReceptor();
        emisor.getAmigos().add(receptor);
        receptor.getAmigos().add(emisor);
        usuarioService.guardarUsuario(emisor);
        usuarioService.guardarUsuario(receptor);

        solicitudService.guardar(solicitud);
        return ResponseEntity.ok(solicitud);
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(@PathVariable Long id) {
        Optional<SolicitudAmistad> solicitudOpt = solicitudService.obtenerSolicitudPorId(id);
        if (solicitudOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SolicitudAmistad solicitud = solicitudOpt.get();
        solicitud.setEstado(SolicitudAmistad.EstadoSolicitud.RECHAZADA);
        solicitudService.guardar(solicitud);
        return ResponseEntity.ok(solicitud);
    }

    @GetMapping("/pendientes/recibidas/{usuarioId}")
    public ResponseEntity<List<SolicitudAmistad>> solicitudesRecibidasPendientes(@PathVariable Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(usuarioId);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<SolicitudAmistad> solicitudes = solicitudService.solicitudesRecibidasPendientes(usuarioOpt.get());
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/pendientes/enviadas/{usuarioId}")
    public ResponseEntity<List<SolicitudAmistad>> solicitudesEnviadasPendientes(@PathVariable Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(usuarioId);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<SolicitudAmistad> solicitudes = solicitudService.solicitudesEnviadasPendientes(usuarioOpt.get());
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/estado")
    public ResponseEntity<String> estadoAmistad(@RequestParam Long usuarioId, @RequestParam Long otroId) {
        if (usuarioId.equals(otroId)) {
            return ResponseEntity.ok("propio");
        }
        Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(usuarioId);
        Optional<Usuario> otroOpt = usuarioService.obtenerUsuarioPorId(otroId);
        if (usuarioOpt.isEmpty() || otroOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("no_existe");
        }
        Usuario usuario = usuarioOpt.get();
        Usuario otro = otroOpt.get();

        if (usuario.getAmigos().contains(otro)) {
            return ResponseEntity.ok("amigos");
        }

        Optional<SolicitudAmistad> enviada = solicitudService.obtenerSolicitudEntreUsuarios(usuario, otro);
        if (enviada.isPresent()) {
            SolicitudAmistad s = enviada.get();
            if (s.getEstado() == SolicitudAmistad.EstadoSolicitud.PENDIENTE) {
                if (s.getUsuarioEmisor().getId().equals(usuarioId)) {
                    return ResponseEntity.ok("pendiente_enviada");
                } else {
                    return ResponseEntity.ok("pendiente_recibida");
                }
            }
        }

        return ResponseEntity.ok("ninguna");
    }
}
