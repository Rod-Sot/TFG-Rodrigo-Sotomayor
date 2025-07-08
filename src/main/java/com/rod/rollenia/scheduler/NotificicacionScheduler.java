package com.rod.rollenia.scheduler;

import com.rod.rollenia.entity.Notificacion;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.NotificacionService;
import com.rod.rollenia.service.UsuarioService;
import com.rod.rollenia.service.CorreoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificicacionScheduler {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private CorreoService correoService;

    @Scheduled(cron = "0 0 8 * * *")
    public void enviarResumenDiario() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        for (Usuario usuario : usuarios) {
            List<Notificacion> pendientes = notificacionService.obtenerNoLeidas(usuario);
            correoService.enviarResumenNotificaciones(usuario, pendientes);
        }
    }
}
