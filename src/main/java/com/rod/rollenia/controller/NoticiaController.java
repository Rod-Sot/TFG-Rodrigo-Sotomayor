package com.rod.rollenia.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.rod.rollenia.entity.Noticia;
import com.rod.rollenia.service.NoticiaService;
import com.rod.rollenia.entity.NoticiaVoto;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.NoticiaRepository;
import com.rod.rollenia.repository.NoticiaVotoRepository;
import com.rod.rollenia.repository.UsuarioRepository;
import com.rod.rollenia.security.JwtUtil;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    private final NoticiaService noticiaService;
    private final NoticiaVotoRepository noticiaVotoRepository;
    private final NoticiaRepository noticiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    public NoticiaController(NoticiaService noticiaService, NoticiaVotoRepository noticiaVotoRepository, NoticiaRepository noticiaRepository, UsuarioRepository usuarioRepository, JwtUtil jwtUtil) {
        this.noticiaService = noticiaService;
        this.noticiaVotoRepository = noticiaVotoRepository;
        this.noticiaRepository = noticiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Noticia> crearNoticia(@RequestBody Noticia noticia, @RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        Usuario autor = usuarioRepository.findByEmail(email).orElseThrow();
        noticia.setAutor(autor);
        noticia.setFechaPublicacion(java.time.LocalDate.now());
        Noticia nuevaNoticia = noticiaService.crearNoticia(noticia);
        return new ResponseEntity<>(nuevaNoticia, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Noticia> obtenerNoticiaPorId(@PathVariable Long id) {
        Optional<Noticia> noticiaOpt = noticiaService.obtenerNoticiaPorId(id);
        if (noticiaOpt.isPresent()) {
            Noticia noticia = noticiaOpt.get();
            noticia.setMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeTrue(noticia.getId()));
            noticia.setNoMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeFalse(noticia.getId()));
            return ResponseEntity.ok(noticia);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public List<Noticia> listarNoticias() {
        List<Noticia> noticias = noticiaService.listarNoticias();
        for (Noticia noticia : noticias) {
            noticia.setMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeTrue(noticia.getId()));
            noticia.setNoMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeFalse(noticia.getId()));
        }
        return noticias;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Noticia> actualizarNoticia(@PathVariable Long id, @RequestBody Noticia noticiaActualizada) {
        try {
            Noticia noticia = noticiaService.actualizarNoticia(id, noticiaActualizada);
            return ResponseEntity.ok(noticia);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarNoticia(@PathVariable Long id) {
        try {
            noticiaService.eliminarNoticia(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeNoticia(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<NoticiaVoto> votoOpt = noticiaVotoRepository.findByUsuarioIdAndNoticiaId(usuarioId, id);
        NoticiaVoto voto;
        Noticia noticia = noticiaService.obtenerNoticiaPorId(id).orElse(null);
        if (noticia == null) return ResponseEntity.notFound().build();

        if (votoOpt.isPresent()) {
            voto = votoOpt.get();
            if (Boolean.TRUE.equals(voto.isLike())) {
                return ResponseEntity.ok().build();
            }
            voto.setLike(true);
        } else {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            voto = new NoticiaVoto();
            voto.setUsuario(usuarioOpt.get());
            voto.setNoticia(noticia);
            voto.setLike(true);
        }
        noticiaVotoRepository.save(voto);

        // ACTUALIZA LOS CONTADORES Y GUARDA
        noticia.setMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeTrue(noticia.getId()));
        noticia.setNoMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeFalse(noticia.getId()));
        noticiaRepository.save(noticia);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<Void> dislikeNoticia(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<NoticiaVoto> votoOpt = noticiaVotoRepository.findByUsuarioIdAndNoticiaId(usuarioId, id);
        NoticiaVoto voto;
        Noticia noticia = noticiaService.obtenerNoticiaPorId(id).orElse(null);
        if (noticia == null) return ResponseEntity.notFound().build();

        if (votoOpt.isPresent()) {
            voto = votoOpt.get();
            if (Boolean.FALSE.equals(voto.isLike())) {
                return ResponseEntity.ok().build();
            }
            voto.setLike(false);
        } else {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            voto = new NoticiaVoto();
            voto.setUsuario(usuarioOpt.get());
            voto.setNoticia(noticia);
            voto.setLike(false);
        }
        noticiaVotoRepository.save(voto);

        // ACTUALIZA LOS CONTADORES Y GUARDA
        noticia.setMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeTrue(noticia.getId()));
        noticia.setNoMeGusta(noticiaVotoRepository.countByNoticiaIdAndEsLikeFalse(noticia.getId()));
        noticiaRepository.save(noticia);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/voto")
    public Map<String, Object> comprobarVoto(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<NoticiaVoto> votoOpt = noticiaVotoRepository.findByUsuarioIdAndNoticiaId(usuarioId, id);
        Map<String, Object> resp = new HashMap<>();
        if (votoOpt.isPresent()) {
            resp.put("haVotado", true);
            resp.put("tipoVoto", votoOpt.get().isLike() ? "like" : "dislike");
        } else {
            resp.put("haVotado", false);
            resp.put("tipoVoto", null);
        }
        return resp;
    }

    // Endpoints para el panel de admin
    @GetMapping("/admin/noticias")
    public ResponseEntity<List<Noticia>> listarNoticiasAdmin() {
        return ResponseEntity.ok(noticiaService.listarTodasNoticias());
    }

    @GetMapping("/admin/noticias/{id}")
    public ResponseEntity<Noticia> obtenerNoticiaAdmin(@PathVariable Long id) {
        Optional<Noticia> noticiaOpt = noticiaService.obtenerNoticiaPorId(id);
        return noticiaOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/noticias/{id}")
    public ResponseEntity<Void> eliminarNoticiaAdmin(@PathVariable Long id) {
        try {
            noticiaService.eliminarNoticia(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
