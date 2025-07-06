package com.rod.rollenia.service;

import com.rod.rollenia.entity.Mensaje;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.MensajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MensajeService {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private UsuarioService usuarioService;

    public List<Mensaje> obtenerConversacion(Long usuario1Id, Long usuario2Id) {
        return mensajeRepository.findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvioAsc(
                usuario1Id, usuario2Id, usuario1Id, usuario2Id
        );
    }

    public Mensaje enviarMensaje(Long emisorId, Long receptorId, String contenido) {
        Usuario emisor = usuarioService.obtenerUsuarioPorId(emisorId).orElseThrow();
        Usuario receptor = usuarioService.obtenerUsuarioPorId(receptorId).orElseThrow();
        Mensaje mensaje = new Mensaje();
        mensaje.setEmisor(emisor);
        mensaje.setReceptor(receptor);
        mensaje.setContenido(contenido);
        mensaje.setFechaEnvio(LocalDateTime.now());
        mensaje.setLeido(false);
        return mensajeRepository.save(mensaje);
    }

    public List<Long> obtenerIdsAmigosConConversacion(Long usuarioId) {
        List<Mensaje> mensajes = mensajeRepository.findAll();
        Set<Long> amigos = new HashSet<>();
        for (Mensaje m : mensajes) {
            if (Objects.equals(m.getEmisor().getId(), usuarioId)) {
                amigos.add(m.getReceptor().getId());
            } else if (Objects.equals(m.getReceptor().getId(), usuarioId)) {
                amigos.add(m.getEmisor().getId());
            }
        }
        return new ArrayList<>(amigos);
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioService.obtenerUsuarioPorId(id);
    }

    public Mensaje obtenerUltimoMensaje(Long usuario1, Long usuario2) {
        List<Mensaje> mensajes = mensajeRepository.findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvioAsc(
                usuario1, usuario2, usuario1, usuario2
        );
        if (mensajes.isEmpty()) return null;
        return mensajes.get(mensajes.size() - 1);
    }

    public int contarNoLeidos(Long usuarioId, Long amigoId) {
        List<Mensaje> mensajes = mensajeRepository.findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvioAsc(
                amigoId, usuarioId, amigoId, usuarioId
        );
        return (int) mensajes.stream()
                .filter(m -> Objects.equals(m.getEmisor().getId(), amigoId) && !m.isLeido())
                .count();
    }

    @Transactional
    public void marcarComoLeidos(Long usuarioId, Long amigoId) {
        List<Mensaje> mensajes = mensajeRepository.findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvioAsc(
                amigoId, usuarioId, amigoId, usuarioId
        );
        for (Mensaje m : mensajes) {
            if (!m.isLeido() && m.getEmisor().getId().equals(amigoId) && m.getReceptor().getId().equals(usuarioId)) {
                m.setLeido(true);
                mensajeRepository.save(m);
            }
        }
    }
}
