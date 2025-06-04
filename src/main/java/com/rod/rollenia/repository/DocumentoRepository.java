package com.rod.rollenia.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rod.rollenia.entity.Documento;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    List<Documento> findByTipo(String tipo);
    List<Documento> findBySistema_Id(Long sistemaId);
    List<Documento> findByTituloContainingIgnoreCase(String titulo);
}
