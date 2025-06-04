package com.rod.rollenia.controller;

import com.rod.rollenia.entity.MensajeForo;
import com.rod.rollenia.service.MensajeForoService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes-foro")
public class MensajeForoController {

    private final MensajeForoService mensajeForoService;

    public MensajeForoController(MensajeForoService mensajeForoService) {
        this.mensajeForoService = mensajeForoService;
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
