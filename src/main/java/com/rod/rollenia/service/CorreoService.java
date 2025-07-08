package com.rod.rollenia.service;

import com.rod.rollenia.entity.Notificacion;
import com.rod.rollenia.entity.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CorreoService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarResumenNotificaciones(Usuario usuario, List<Notificacion> notificaciones) {
        if (notificaciones == null || notificaciones.isEmpty() || usuario.getEmail() == null) return;

        StringBuilder cuerpo = new StringBuilder();
        cuerpo.append("Hola ").append(usuario.getNombreUsuario()).append(",\n\n");
        cuerpo.append("Tienes ").append(notificaciones.size()).append(" notificaciones pendientes:\n\n");

        for (Notificacion n : notificaciones) {
            cuerpo.append("- [").append(n.getTipo()).append("] ")
                  .append(n.getMensaje());
            cuerpo.append("\n");
        }
        cuerpo.append("\nPuedes acceder a la plataforma para gestionarlas.\n\nUn saludo,\nEl equipo de Rollenia");

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(usuario.getEmail());
        mensaje.setSubject("Resumen diario de notificaciones - Rollenia");
        mensaje.setText(cuerpo.toString());

        mailSender.send(mensaje);
    }
}
