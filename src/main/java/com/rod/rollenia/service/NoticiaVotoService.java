package com.rod.rollenia.service;

import com.rod.rollenia.repository.NoticiaVotoRepository;
import com.rod.rollenia.entity.Noticia;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.entity.NoticiaVoto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rod.rollenia.repository.NoticiaRepository;
import com.rod.rollenia.repository.UsuarioRepository;
@Service
public class NoticiaVotoService {

    @Autowired
    private NoticiaVotoRepository noticiaVotoRepository;

    @Autowired
    private NoticiaRepository noticiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

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
}
