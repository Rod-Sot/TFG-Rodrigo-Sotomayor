package com.rod.rollenia.service;

import com.rod.rollenia.entity.Foro;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.ForoRepository;
import com.rod.rollenia.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ForoService {

    private final ForoRepository foroRepository;
    private final UsuarioRepository usuarioRepository;

    public ForoService(ForoRepository foroRepository, UsuarioRepository usuarioRepository) {
        this.foroRepository = foroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Foro> listarForos() {
        return foroRepository.findAll();
    }

    public Optional<Foro> obtenerForoPorId(Long id) {
        return foroRepository.findById(id);
    }

    public Foro crearForo(String titulo, String mensajeInicial, String categoria, Long autorId) {
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Foro foro = new Foro();
        foro.setTitulo(titulo);
        foro.setMensajeInicial(mensajeInicial);
        foro.setCategoria(categoria);
        foro.setFechaCreacion(LocalDateTime.now());
        foro.setAutor(autor);
        foro.setRespuestas(0);
        foro.setVisitas(0);

        return foroRepository.save(foro);
    }

    public void eliminarForo(Long id) {
        foroRepository.deleteById(id);
    }

    public void sumarVisita(Long foroId) {
        Foro foro = foroRepository.findById(foroId).orElseThrow();
        foro.setVisitas(foro.getVisitas() + 1);
        foroRepository.save(foro);
    }

    public Set<Usuario> obtenerParticipantes(Long foroId) {
        Foro foro = foroRepository.findById(foroId).orElse(null);
        if (foro == null) return Set.of();
        Set<Usuario> participantes = new HashSet<>();
        if (foro.getComentarios() != null) {
            foro.getComentarios().forEach(c -> participantes.add(c.getAutor()));
        }
        return participantes;
    }
}
