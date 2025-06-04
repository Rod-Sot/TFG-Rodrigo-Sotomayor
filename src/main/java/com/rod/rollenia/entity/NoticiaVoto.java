package com.rod.rollenia.entity;

import jakarta.persistence.*;

@Entity
public class NoticiaVoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Noticia noticia;

    // true = like, false = dislike
    @Column(nullable = false)
    private boolean esLike;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Noticia getNoticia() {
        return noticia;
    }

    public void setNoticia(Noticia noticia) {
        this.noticia = noticia;
    }

    public boolean isLike() {
        return esLike;
    }

    public void setLike(boolean like) {
        this.esLike = like;
    }
}
