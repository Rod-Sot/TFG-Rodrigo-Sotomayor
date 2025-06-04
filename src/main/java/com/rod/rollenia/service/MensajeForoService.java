package com.rod.rollenia.service;

import com.rod.rollenia.entity.MensajeForo;
import com.rod.rollenia.entity.Foro;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.MensajeForoRepository;
import com.rod.rollenia.repository.ForoRepository;
import com.rod.rollenia.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MensajeForoService {

    private final MensajeForoRepository mensajeForoRepository;
    private final ForoRepository foroRepository;
    private final UsuarioRepository usuarioRepository;

    public MensajeForoService(MensajeForoRepository mensajeForoRepository, ForoRepository foroRepository, UsuarioRepository usuarioRepository) {
        this.mensajeForoRepository = mensajeForoRepository;
        this.foroRepository = foroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<MensajeForo> listarMensajesPorForo(Long foroId) {
        return mensajeForoRepository.findByForoId(foroId);
    }

    public MensajeForo crearMensaje(Long foroId, Long autorId, String contenido) {
        Foro foro = foroRepository.findById(foroId)
                .orElseThrow(() -> new IllegalArgumentException("Foro no encontrado"));
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        MensajeForo mensaje = new MensajeForo();
        mensaje.setForo(foro);
        mensaje.setAutor(autor);
        mensaje.setContenido(contenido);
        mensaje.setFechaCreacion(LocalDateTime.now());

        MensajeForo guardado = mensajeForoRepository.save(mensaje);

        foro.setRespuestas(foro.getRespuestas() + 1);
        foroRepository.save(foro);

        return guardado;
    }

    public void eliminarMensaje(Long mensajeId) {
        MensajeForo mensaje = mensajeForoRepository.findById(mensajeId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));
        Foro foro = mensaje.getForo();
        mensajeForoRepository.deleteById(mensajeId);
        foro.setRespuestas(Math.max(0, foro.getRespuestas() - 1));
        foroRepository.save(foro);
    }
}
