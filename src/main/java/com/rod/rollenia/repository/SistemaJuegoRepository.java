package com.rod.rollenia.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rod.rollenia.entity.SistemaJuego;

@Repository
public interface SistemaJuegoRepository extends JpaRepository<SistemaJuego, Long> {
    Optional<SistemaJuego> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
}

