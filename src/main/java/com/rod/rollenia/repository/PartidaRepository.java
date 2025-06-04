package com.rod.rollenia.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.stereotype.Repository;

import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.entity.Usuario;


@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {
    List<Partida> findByEstado(String estado);
    List<Partida> findByDuracion(String duracion);
    List<Partida> findBySistemaJuego_NombreContainingIgnoreCase(String nombre);
    List<Partida> findByCreador(Usuario creador);
    List<Partida> findByJugadoresContaining(Usuario jugador);
}

