package com.rod.rollenia.repository;

import com.rod.rollenia.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByNoticiaIdOrderByFechaCreacionAsc(Long noticiaId);
}
