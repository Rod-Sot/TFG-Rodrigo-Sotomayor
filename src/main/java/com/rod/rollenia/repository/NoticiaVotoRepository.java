package com.rod.rollenia.repository;

import com.rod.rollenia.entity.NoticiaVoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NoticiaVotoRepository extends JpaRepository<NoticiaVoto, Long> {
    Optional<NoticiaVoto> findByUsuarioIdAndNoticiaId(Long usuarioId, Long noticiaId);
    int countByNoticiaIdAndEsLikeTrue(Long noticiaId);
    int countByNoticiaIdAndEsLikeFalse(Long noticiaId);
}
