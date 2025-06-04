package com.rod.rollenia.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class SistemaJuego {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private LocalDate fechaPrimeraPublicacion;
    private LocalDate fechaUltimaActualizacion;

    @Lob
    private String descripcion;

    @Column(name = "imagen_url")
    private String imagenUrl= "dungeons_system.jpg";

    @OneToMany(mappedBy = "sistemaRelacionado")
    @JsonIgnoreProperties("sistemaRelacionado")
    private List<Noticia> noticiasRelacionadas = new ArrayList<>();

    @OneToMany(mappedBy = "sistema")
    @JsonIgnoreProperties("sistema")
    private List<Documento> documentos = new ArrayList<>();

    @ManyToMany(mappedBy = "sistemasSeguidos")
    @JsonIgnoreProperties("sistemasSeguidos")
    private List<Usuario> seguidores = new ArrayList<>();

    @OneToMany(mappedBy = "sistemaJuego")
    @JsonIgnoreProperties("sistemaJuego")
    private List<Partida> partidas = new ArrayList<>();

    public SistemaJuego() {}

    public SistemaJuego(String nombre, LocalDate fechaPrimeraPublicacion, LocalDate fechaUltimaActualizacion, String descripcion) {
        this.nombre = nombre;
        this.fechaPrimeraPublicacion = fechaPrimeraPublicacion;
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
        this.descripcion = descripcion;
    }

    public SistemaJuego(Long id, String nombre, LocalDate fechaPrimeraPublicacion, LocalDate fechaUltimaActualizacion, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.fechaPrimeraPublicacion = fechaPrimeraPublicacion;
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
        this.descripcion = descripcion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDate getFechaPrimeraPublicacion() {
        return fechaPrimeraPublicacion;
    }

    public void setFechaPrimeraPublicacion(LocalDate fechaPrimeraPublicacion) {
        this.fechaPrimeraPublicacion = fechaPrimeraPublicacion;
    }

    public LocalDate getFechaUltimaActualizacion() {
        return fechaUltimaActualizacion;
    }

    public void setFechaUltimaActualizacion(LocalDate fechaUltimaActualizacion) {
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public List<Noticia> getNoticiasRelacionadas() {
        return noticiasRelacionadas;
    }

    public void setNoticiasRelacionadas(List<Noticia> noticiasRelacionadas) {
        this.noticiasRelacionadas = noticiasRelacionadas;
    }

    public List<Documento> getDocumentos() {
        return documentos;
    }

    public void setDocumentos(List<Documento> documentos) {
        this.documentos = documentos;
    }

    public List<Usuario> getSeguidores() {
        return seguidores;
    }

    public void setSeguidores(List<Usuario> seguidores) {
        this.seguidores = seguidores;
    }

    public List<Partida> getPartidas() {
        return partidas;
    }

    public void setPartidas(List<Partida> partidas) {
        this.partidas = partidas;
    }

    @Override
    public String toString() {
        return "SistemaJuego{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", fechaPrimeraPublicacion=" + fechaPrimeraPublicacion +
                ", fechaUltimaActualizacion=" + fechaUltimaActualizacion +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SistemaJuego that = (SistemaJuego) o;
        return id != null && id.equals(that.id) &&
        nombre != null && nombre.equals(that.nombre);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
