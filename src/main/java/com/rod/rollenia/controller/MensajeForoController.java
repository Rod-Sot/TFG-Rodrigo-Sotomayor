package com.rod.rollenia.controller;

import com.rod.rollenia.entity.Foro;
import com.rod.rollenia.entity.MensajeForo;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.MensajeForoService;
import com.rod.rollenia.service.NotificacionService;
import com.rod.rollenia.service.ForoService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes-foro")
public class MensajeForoController {

    private final MensajeForoService mensajeForoService;
    private final NotificacionService notificacionService;
    private final ForoService foroService;

    public MensajeForoController(MensajeForoService mensajeForoService, NotificacionService notificacionService, ForoService foroService) {
        this.mensajeForoService = mensajeForoService;
        this.notificacionService = notificacionService;
        this.foroService = foroService;
    }

    @GetMapping("/foro/{foroId}")
    public List<MensajeForo> listarMensajesPorForo(@PathVariable Long foroId) {
        return mensajeForoService.listarMensajesPorForo(foroId);
    }

    @PostMapping
    public ResponseEntity<?> crearMensaje(@RequestBody Map<String, Object> datos) {
        try {
            Long foroId = Long.valueOf(datos.get("foroId").toString());
            Long autorId = Long.valueOf(datos.get("autorId").toString());
            String contenido = (String) datos.get("contenido");

            MensajeForo mensaje = mensajeForoService.crearMensaje(foroId, autorId, contenido);
            Foro foro = foroService.obtenerForoPorId(foroId).orElse(null);
            Usuario autor = mensaje.getAutor();
            if (foro != null && autor != null) {
                if (!foro.getAutor().getId().equals(autor.getId())) {
                    notificacionService.crearNotificacion(
                        foro.getAutor(),
                        "FORO_RESPUESTA",
                        autor.getNombreUsuario() + " ha respondido en tu foro: '" + foro.getTitulo() + "'.",
                        "/foros/" + foro.getId()
                    );
                }
                foroService.obtenerParticipantes(foroId).stream()
                    .filter(participante -> !participante.getId().equals(autor.getId()))
                    .forEach(participante -> notificacionService.crearNotificacion(
                        participante,
                        "FORO_ACTIVIDAD",
                        autor.getNombreUsuario() + " ha publicado una nueva respuesta en el foro '" + foro.getTitulo() + "'.",
                        "/foros/" + foro.getId()
                    ));
            }

            return new ResponseEntity<>(mensaje, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{mensajeId}")
    public ResponseEntity<Void> eliminarMensaje(@PathVariable Long mensajeId) {
        mensajeForoService.eliminarMensaje(mensajeId);
        return ResponseEntity.noContent().build();
    }
}
