package com.rod.rollenia.entity;

import jakarta.persistence.*;

@Entity
@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"titulo", "sistema_id"})
)
public class Documento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String urlInfo;

    @Column(nullable = false)
    private String tipo; // pdf, libro físico, etc.

    @ManyToOne
    @JoinColumn(name = "sistema_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"documentos", "noticiasRelacionadas", "seguidores", "partidas"})
    private SistemaJuego sistema;

    public Documento() {}

    public Documento(String titulo, String urlInfo, String tipo, SistemaJuego sistema) {
        this.titulo = titulo;
        this.urlInfo = urlInfo;
        this.tipo = tipo;
        this.sistema = sistema;
    }

    public Documento(Long id, String titulo, String urlInfo, String tipo, SistemaJuego sistema) {
        this.id = id;
        this.titulo = titulo;
        this.urlInfo = urlInfo;
        this.tipo = tipo;
        this.sistema = sistema;
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

    public String getUrlInfo() {
        return urlInfo;
    }

    public void setUrlInfo(String urlInfo) {
        this.urlInfo = urlInfo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public SistemaJuego getSistema() {
        return sistema;
    }

    public void setSistema(SistemaJuego sistema) {
        this.sistema = sistema;
    }

    @Override
    public String toString() {
        return "Documento{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", tipo='" + tipo + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Documento that = (Documento) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

