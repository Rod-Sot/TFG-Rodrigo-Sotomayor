package com.rod.rollenia.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
public class MensajeForo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "foro_id", nullable = false)
    @JsonIgnore
    private Foro foro;

    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(length = 2000, nullable = false)
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Foro getForo() { return foro; }
    public void setForo(Foro foro) { this.foro = foro; }

    public Usuario getAutor() { return autor; }
    public void setAutor(Usuario autor) { this.autor = autor; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
