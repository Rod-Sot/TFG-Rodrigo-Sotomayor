package com.rod.rollenia.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
public class Noticia {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Lob
    @Column(nullable = false)
    private String contenido;

    @Column(nullable = false)
    private LocalDate fechaPublicacion;

    @ManyToOne
    @JoinColumn(name = "autor_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"noticiasPublicadas", "partidasCreadas", "sistemasSeguidos", "partidasComoJugador"})
    private Usuario autor;

    @ManyToOne
    @JoinColumn(name = "sistema_juego_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"noticiasRelacionadas", "documentos", "seguidores", "partidas"})
    private SistemaJuego sistemaRelacionado;

    @OneToMany(mappedBy = "noticia", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("noticia")
    private List<Comentario> comentarios = new ArrayList<>();

    @Column(nullable = false)
    private int meGusta = 0;

    @Column(nullable = false)
    private int noMeGusta = 0;

    public Noticia() {}

    public Noticia(String titulo, String contenido, LocalDate fechaPublicacion, Usuario autor, SistemaJuego sistemaRelacionado) {
        this.titulo = titulo;
        this.contenido = contenido;
        this.fechaPublicacion = fechaPublicacion;
        this.autor = autor;
        this.sistemaRelacionado = sistemaRelacionado;
    }

    public Noticia(Long id, String titulo, String contenido, LocalDate fechaPublicacion, Usuario autor, SistemaJuego sistemaRelacionado) {
        this.id = id;
        this.titulo = titulo;
        this.contenido = contenido;
        this.fechaPublicacion = fechaPublicacion;
        this.autor = autor;
        this.sistemaRelacionado = sistemaRelacionado;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public LocalDate getFechaPublicacion() {
        return fechaPublicacion;
    }

    public void setFechaPublicacion(LocalDate fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public SistemaJuego getSistemaRelacionado() {
        return sistemaRelacionado;
    }

    public void setSistemaRelacionado(SistemaJuego sistemaRelacionado) {
        this.sistemaRelacionado = sistemaRelacionado;
    }

    public List<Comentario> getComentarios() {
        return comentarios;
    }

    public void setComentarios(List<Comentario> comentarios) {
        this.comentarios = comentarios;
    }

    public int getMeGusta() {
        return meGusta;
    }

    public void setMeGusta(int meGusta) {
        this.meGusta = meGusta;
    }

    public int getNoMeGusta() {
        return noMeGusta;
    }

    public void setNoMeGusta(int noMeGusta) {
        this.noMeGusta = noMeGusta;
    }

    @Override
    public String toString() {
        return "Noticia{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", fechaPublicacion=" + fechaPublicacion +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Noticia noticia = (Noticia) o;
        return id != null && id.equals(noticia.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

