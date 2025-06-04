package com.rod.rollenia.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rod.rollenia.entity.Noticia;

@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findByAutorIdOrderByFechaPublicacionDesc(Long autorId);
    List<Noticia> findBySistemaRelacionado_NombreContainingIgnoreCase(String nombreSistema);
}

