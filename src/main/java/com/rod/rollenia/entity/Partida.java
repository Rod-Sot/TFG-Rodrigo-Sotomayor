package com.rod.rollenia.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Lob
    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private String duracion; // "one-shot", "multisesión", "campaña"

    @Column(nullable = false)
    private String estado = "Abierta";  // "abierta", "en progreso", "finalizada"

    @Column(nullable = false)
    private int maxJugadores;

    @Column(nullable = false)
    private int jugadoresActuales = 0;

    @Column(nullable = false)
    private LocalDate fechaCreacion;

    @ManyToOne
    @JsonIgnoreProperties({"partidasCreadas", "noticiasPublicadas", "sistemasSeguidos", "partidasComoJugador"})
    private Usuario creador;

    @ManyToOne
    @JsonIgnoreProperties({"noticiasRelacionadas", "documentos", "seguidores", "partidas"})
    private SistemaJuego sistemaJuego;

    @ManyToMany
    @JsonIgnoreProperties({"partidasComoJugador", "partidasCreadas", "noticiasPublicadas", "sistemasSeguidos"})
    private List<Usuario> jugadores = new ArrayList<>();
    
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDuracion() {
        return duracion;
    }

    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public int getMaxJugadores() {
        return maxJugadores;
    }

    public void setMaxJugadores(int maxJugadores) {
        this.maxJugadores = maxJugadores;
    }

    public int getJugadoresActuales() {
        return jugadoresActuales;
    }

    public void setJugadoresActuales(int jugadoresActuales) {
        this.jugadoresActuales = jugadoresActuales;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Usuario getCreador() {
        return creador;
    }

    public void setCreador(Usuario creador) {
        this.creador = creador;
    }

    public SistemaJuego getSistemaJuego() {
        return sistemaJuego;
    }

    public void setSistemaJuego(SistemaJuego sistemaJuego) {
        this.sistemaJuego = sistemaJuego;
    }

    public List<Usuario> getJugadores() {
        return jugadores;
    }

    public void setJugadores(List<Usuario> jugadores) {
        this.jugadores = jugadores;
    }

    @Override
    public String toString() {
        return "Partida{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", estado='" + estado + '\'' +
                ", maxJugadores=" + maxJugadores +
                ", jugadoresActuales=" + jugadoresActuales +
                ", fechaCreacion=" + fechaCreacion +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Partida partida = (Partida) o;
        return id != null && id.equals(partida.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

