package com.rod.rollenia.service;

import com.rod.rollenia.entity.Comentario;
import com.rod.rollenia.repository.ComentarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;

    public ComentarioService(ComentarioRepository comentarioRepository) {
        this.comentarioRepository = comentarioRepository;
    }

    public Comentario guardarComentario(Comentario comentario) {
        return comentarioRepository.save(comentario);
    }

    public List<Comentario> obtenerComentariosPorNoticia(Long noticiaId) {
        return comentarioRepository.findByNoticiaIdOrderByFechaCreacionAsc(noticiaId);
    }

    public Optional<Comentario> obtenerComentarioPorId(Long id) {
        return comentarioRepository.findById(id);
    }

    public void eliminarComentario(Long id) {
        comentarioRepository.deleteById(id);
    }
}
