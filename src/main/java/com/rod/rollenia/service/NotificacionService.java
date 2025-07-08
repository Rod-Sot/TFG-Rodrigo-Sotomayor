package com.rod.rollenia.service;

import com.rod.rollenia.entity.Notificacion;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public void crearNotificacion(Usuario usuario, String tipo, String mensaje, String url) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipo(tipo);
        n.setMensaje(mensaje);
        n.setUrl(url);
        n.setFecha(LocalDateTime.now());
        n.setLeida(false);
        notificacionRepository.save(n);
    }

    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
    }

    public List<Notificacion> obtenerTodasPorUsuario(Usuario usuario) {
        return notificacionRepository.findByUsuarioOrderByFechaDesc(usuario);
    }

    public void marcarComoLeidas(List<Notificacion> notificaciones) {
        for (Notificacion n : notificaciones) {
            n.setLeida(true);
            notificacionRepository.save(n);
        }
    }

    public Notificacion buscarPorId(Long id) {
        return notificacionRepository.findById(id).orElse(null);
    }
}
