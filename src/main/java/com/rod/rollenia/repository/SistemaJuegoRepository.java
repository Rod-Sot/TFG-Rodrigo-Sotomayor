package com.rod.rollenia.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rod.rollenia.entity.SistemaJuego;

@Repository
public interface SistemaJuegoRepository extends JpaRepository<SistemaJuego, Long> {
    Optional<SistemaJuego> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
    @Query("SELECT s FROM SistemaJuego s LEFT JOIN FETCH s.seguidores WHERE s.id = :id")
    Optional<SistemaJuego> findByIdWithSeguidores(@Param("id") Long id);
}

