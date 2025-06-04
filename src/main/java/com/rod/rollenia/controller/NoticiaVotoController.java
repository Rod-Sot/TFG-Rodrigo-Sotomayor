package com.rod.rollenia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rod.rollenia.service.NoticiaService;

@RestController
public class NoticiaVotoController {
    
    @Autowired
    private NoticiaService noticiaService;

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeNoticia(@PathVariable Long id, @RequestParam Long usuarioId) {
        noticiaService.votarNoticia(id, usuarioId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<?> dislikeNoticia(@PathVariable Long id, @RequestParam Long usuarioId) {
        noticiaService.votarNoticia(id, usuarioId, false);
        return ResponseEntity.ok().build();
    }
}
