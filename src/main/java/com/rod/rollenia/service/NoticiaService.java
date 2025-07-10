package com.rod.rollenia.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rod.rollenia.entity.Noticia;
import com.rod.rollenia.repository.NoticiaRepository;
import com.rod.rollenia.repository.NoticiaVotoRepository;


import java.util.List;
import java.util.Optional;

@Service
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;

    @Autowired
    private NoticiaVotoRepository noticiaVotoRepository;

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

    public List<Noticia> listarTodasNoticias() {
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
