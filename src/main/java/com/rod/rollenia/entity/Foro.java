package com.rod.rollenia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Foro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 2000)
    private String mensajeInicial;

    @OneToMany(mappedBy = "foro", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MensajeForo> comentarios;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private int respuestas = 0;
    private int visitas = 0;

    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @ManyToOne
    @JoinColumn(name = "sistema_juego_id")
    private SistemaJuego sistemaJuego;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getMensajeInicial() { return mensajeInicial; }
    public void setMensajeInicial(String mensajeInicial) { this.mensajeInicial = mensajeInicial; }

    public List<MensajeForo> getComentarios() { return comentarios; }
    public void setComentarios(List<MensajeForo> comentarios) { this.comentarios = comentarios; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public int getRespuestas() { return respuestas; }
    public void setRespuestas(int respuestas) { this.respuestas = respuestas; }

    public int getVisitas() { return visitas; }
    public void setVisitas(int visitas) { this.visitas = visitas; }

    public Usuario getAutor() { return autor; }
    public void setAutor(Usuario autor) { this.autor = autor; }

    public SistemaJuego getSistemaJuego() { return sistemaJuego; }
    public void setSistemaJuego(SistemaJuego sistemaJuego) { this.sistemaJuego = sistemaJuego; }
}
