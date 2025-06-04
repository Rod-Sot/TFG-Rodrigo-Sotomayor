package com.rod.rollenia.service;

import org.springframework.stereotype.Service;

import com.rod.rollenia.entity.Partida;
import com.rod.rollenia.repository.PartidaRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PartidaService {

    private final PartidaRepository partidaRepository;

    public PartidaService(PartidaRepository partidaRepository) {
        this.partidaRepository = partidaRepository;
    }

    public Partida crearPartida(Partida partida) {
        return partidaRepository.save(partida);
    }

    public Optional<Partida> obtenerPorId(Long id) {
        return partidaRepository.findById(id);
    }
    public Partida guardar(Partida partida) {
    return partidaRepository.save(partida);
    }

    public List<Partida> listarPartidas() {
        return partidaRepository.findAll();
    }

    public Partida actualizarPartida(Long id, Partida partidaActualizada) {
        return partidaRepository.findById(id).map(partida -> {
            partida.setTitulo(partidaActualizada.getTitulo());
            partida.setDescripcion(partidaActualizada.getDescripcion());
            partida.setDuracion(partidaActualizada.getDuracion());
            partida.setEstado(partidaActualizada.getEstado());
            partida.setMaxJugadores(partidaActualizada.getMaxJugadores());
            partida.setJugadoresActuales(partidaActualizada.getJugadoresActuales());
            partida.setFechaCreacion(partidaActualizada.getFechaCreacion());
            partida.setCreador(partidaActualizada.getCreador());
            partida.setSistemaJuego(partidaActualizada.getSistemaJuego());
            partida.setJugadores(partidaActualizada.getJugadores());
            return partidaRepository.save(partida);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Partida no encontrada con ID: " + id));
    }

    public void eliminarPartida(Long id) {
        if (!partidaRepository.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Partida no encontrada con ID: " + id);
        }
        partidaRepository.deleteById(id);
    }
}
