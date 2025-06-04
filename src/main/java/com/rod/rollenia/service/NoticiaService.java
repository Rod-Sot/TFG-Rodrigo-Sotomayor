package com.rod.rollenia.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rod.rollenia.entity.Noticia;
import com.rod.rollenia.entity.NoticiaVoto;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.NoticiaRepository;
import com.rod.rollenia.repository.NoticiaVotoRepository;
import com.rod.rollenia.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;

@Service
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;

    @Autowired
    private NoticiaVotoRepository noticiaVotoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public NoticiaService(NoticiaRepository noticiaRepository, NoticiaVotoRepository noticiaVotoRepository) {
        this.noticiaRepository = noticiaRepository;
        this.noticiaVotoRepository = noticiaVotoRepository;
    }

    public Noticia crearNoticia(Noticia noticia) {
        return noticiaRepository.save(noticia);
    }

    public Optional<Noticia> obtenerNoticiaPorId(Long id) {
        return noticiaRepository.findById(id);
    }

    public List<Noticia> listarNoticias() {
        return noticiaRepository.findAll();
    }

    public Noticia actualizarNoticia(Long id, Noticia noticiaActualizada) {
        return noticiaRepository.findById(id).map(noticia -> {
            noticia.setTitulo(noticiaActualizada.getTitulo());
            noticia.setContenido(noticiaActualizada.getContenido());
            noticia.setFechaPublicacion(noticiaActualizada.getFechaPublicacion());
            noticia.setAutor(noticiaActualizada.getAutor());
            noticia.setSistemaRelacionado(noticiaActualizada.getSistemaRelacionado());
            return noticiaRepository.save(noticia);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Noticia no encontrada con ID: " + id));
    }

    public void eliminarNoticia(Long id) {
        if (!noticiaRepository.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Noticia no encontrada con ID: " + id);
        }
        noticiaRepository.deleteById(id);
    }

    public Noticia incrementarMeGusta(Long id) {
        return noticiaRepository.findById(id).map(noticia -> {
            noticia.setMeGusta(noticia.getMeGusta() + 1);
            return noticiaRepository.save(noticia);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Noticia no encontrada con ID: " + id));
    }

    public Noticia incrementarNoMeGusta(Long id) {
        return noticiaRepository.findById(id).map(noticia -> {
            noticia.setNoMeGusta(noticia.getNoMeGusta() + 1);
            return noticiaRepository.save(noticia);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Noticia no encontrada con ID: " + id));
    }

    public void votarNoticia(Long noticiaId, Long usuarioId, boolean like) {
        if (noticiaVotoRepository.findByUsuarioIdAndNoticiaId(usuarioId, noticiaId).isPresent()) {
            throw new IllegalStateException("El usuario ya ha votado esta noticia.");
        }
        Noticia noticia = noticiaRepository.findById(noticiaId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Noticia no encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Usuario no encontrado"));

        NoticiaVoto voto = new NoticiaVoto();
        voto.setNoticia(noticia);
        voto.setUsuario(usuario);
        voto.setLike(like);
        noticiaVotoRepository.save(voto);
    }
    public int contarLikes(Long noticiaId) {
        return noticiaVotoRepository.countByNoticiaIdAndEsLikeTrue(noticiaId);
    }

    public int contarDislikes(Long noticiaId) {
        return noticiaVotoRepository.countByNoticiaIdAndEsLikeFalse(noticiaId);
    }

    public NoticiaVotoRepository getNoticiaVotoRepository() {
        return noticiaVotoRepository;
    }
}
