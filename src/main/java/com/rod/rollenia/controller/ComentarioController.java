package com.rod.rollenia.controller;

import com.rod.rollenia.entity.Comentario;
import com.rod.rollenia.entity.Noticia;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.service.ComentarioService;
import com.rod.rollenia.repository.NoticiaRepository;
import com.rod.rollenia.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;
    private final NoticiaRepository noticiaRepository;
    private final UsuarioRepository usuarioRepository;

    public ComentarioController(ComentarioService comentarioService, NoticiaRepository noticiaRepository, UsuarioRepository usuarioRepository) {
        this.comentarioService = comentarioService;
        this.noticiaRepository = noticiaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/noticia/{noticiaId}")
    public List<Comentario> obtenerComentariosPorNoticia(@PathVariable Long noticiaId) {
        return comentarioService.obtenerComentariosPorNoticia(noticiaId);
    }

    @PostMapping("/noticia/{noticiaId}")
    public ResponseEntity<Comentario> crearComentario(
            @PathVariable Long noticiaId,
            @RequestParam Long autorId,
            @RequestBody Comentario comentario) {

        Optional<Noticia> noticiaOpt = noticiaRepository.findById(noticiaId);
        Optional<Usuario> autorOpt = usuarioRepository.findById(autorId);

        if (noticiaOpt.isEmpty() || autorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        comentario.setNoticia(noticiaOpt.get());
        comentario.setAutor(autorOpt.get());
        comentario.setFechaCreacion(LocalDateTime.now());

        Comentario guardado = comentarioService.guardarComentario(comentario);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarComentario(@PathVariable Long id) {
        comentarioService.eliminarComentario(id);
        return ResponseEntity.noContent().build();
    }
}
