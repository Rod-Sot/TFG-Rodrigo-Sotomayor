package com.rod.rollenia.controller;

import com.rod.rollenia.entity.Mensaje;
import com.rod.rollenia.service.MensajeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    @Autowired
    private MensajeService mensajeService;

    @GetMapping("/conversacion")
    public List<Mensaje> obtenerConversacion(
            @RequestParam Long usuario1,
            @RequestParam Long usuario2) {
        return mensajeService.obtenerConversacion(usuario1, usuario2);
    }

    @PostMapping("/enviar")
    public Mensaje enviarMensaje(@RequestBody Map<String, Object> payload) {
        Long emisorId = Long.valueOf(payload.get("emisorId").toString());
        Long receptorId = Long.valueOf(payload.get("receptorId").toString());
        String contenido = payload.get("contenido").toString();
        return mensajeService.enviarMensaje(emisorId, receptorId, contenido);
    }

    @GetMapping("/conversaciones")
    public List<Map<String, Object>> obtenerConversaciones(@RequestParam Long usuarioId) {
        List<Long> amigosIds = mensajeService.obtenerIdsAmigosConConversacion(usuarioId);

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Long amigoId : amigosIds) {
            var amigo = mensajeService.obtenerUsuarioPorId(amigoId).orElse(null);
            if (amigo == null) continue;
            Mensaje ultimo = mensajeService.obtenerUltimoMensaje(usuarioId, amigoId);
            int noLeidos = mensajeService.contarNoLeidos(usuarioId, amigoId);

            Map<String, Object> conv = new HashMap<>();
            Map<String, Object> amigoMap = new HashMap<>();
            amigoMap.put("id", amigo.getId());
            amigoMap.put("nombreUsuario", amigo.getNombreUsuario());
            amigoMap.put("avatarUrl", amigo.getAvatarUrl());
            conv.put("amigo", amigoMap);

            if (ultimo != null) {
                Map<String, Object> ultimoMensaje = new HashMap<>();
                ultimoMensaje.put("contenido", ultimo.getContenido());
                ultimoMensaje.put("fechaEnvio", ultimo.getFechaEnvio());
                conv.put("ultimoMensaje", ultimoMensaje);
            } else {
                conv.put("ultimoMensaje", null);
            }
            conv.put("noLeidos", noLeidos);

            resultado.add(conv);
        }
        return resultado;
    }

    @PostMapping("/marcar-leidos")
    public void marcarComoLeidos(@RequestBody Map<String, Long> payload) {
        Long usuarioId = payload.get("usuarioId");
        Long amigoId = payload.get("amigoId");
        mensajeService.marcarComoLeidos(usuarioId, amigoId);
    }
}
