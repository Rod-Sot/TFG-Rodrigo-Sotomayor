package com.rod.rollenia.controller;

import com.rod.rollenia.entity.Notificacion;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.NotificacionService;
import com.rod.rollenia.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/no-leidas/{usuarioId}")
    public List<Notificacion> obtenerNoLeidas(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(usuarioId).orElseThrow();
        return notificacionService.obtenerNoLeidas(usuario);
    }

    @GetMapping("/todas/{usuarioId}")
    public List<Notificacion> obtenerTodas(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(usuarioId).orElseThrow();
        return notificacionService.obtenerTodasPorUsuario(usuario);
    }

    @PostMapping("/marcar-leidas")
    public void marcarComoLeidas(@RequestBody List<Long> ids) {
        List<Notificacion> notificaciones = ids.stream()
                .map(id -> notificacionService.buscarPorId(id))
                .filter(n -> n != null)
                .toList();
        notificacionService.marcarComoLeidas(notificaciones);
    }
}
