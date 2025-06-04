package com.rod.rollenia.service;

import org.springframework.stereotype.Service;

import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.repository.SistemaJuegoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SistemaJuegoService {

    private final SistemaJuegoRepository sistemaJuegoRepository;

    public SistemaJuegoService(SistemaJuegoRepository sistemaJuegoRepository) {
        this.sistemaJuegoRepository = sistemaJuegoRepository;
    }

    public SistemaJuego crearSistemaJuego(SistemaJuego sistemaJuego) {
    if (sistemaJuegoRepository.existsByNombre(sistemaJuego.getNombre())) {
        throw new IllegalArgumentException("Ya existe un sistema con ese nombre.");
    }
    return sistemaJuegoRepository.save(sistemaJuego);
    }

    public Optional<SistemaJuego> obtenerSistemaJuegoPorId(Long id) {
        return sistemaJuegoRepository.findById(id);
    }

    public List<SistemaJuego> listarSistemasJuego() {
        return sistemaJuegoRepository.findAll();
    }

    public SistemaJuego actualizarSistemaJuego(Long id, SistemaJuego sistemaJuegoActualizado) {
        return sistemaJuegoRepository.findById(id).map(sistemaJuego -> {
            sistemaJuego.setNombre(sistemaJuegoActualizado.getNombre());
            sistemaJuego.setFechaPrimeraPublicacion(sistemaJuegoActualizado.getFechaPrimeraPublicacion());
            sistemaJuego.setFechaUltimaActualizacion(sistemaJuegoActualizado.getFechaUltimaActualizacion());
            sistemaJuego.setDescripcion(sistemaJuegoActualizado.getDescripcion());
            sistemaJuego.setNoticiasRelacionadas(sistemaJuegoActualizado.getNoticiasRelacionadas());
            sistemaJuego.setDocumentos(sistemaJuegoActualizado.getDocumentos());
            sistemaJuego.setSeguidores(sistemaJuegoActualizado.getSeguidores());
            sistemaJuego.setPartidas(sistemaJuegoActualizado.getPartidas());
            sistemaJuego.setImagenUrl(sistemaJuegoActualizado.getImagenUrl());
            return sistemaJuegoRepository.save(sistemaJuego);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Sistema de juego no encontrado con ID: " + id));
    }

    public void eliminarSistemaJuego(Long id) {
        if (!sistemaJuegoRepository.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Sistema de juego no encontrado con ID: " + id);
        }
        sistemaJuegoRepository.deleteById(id);
    }
}
