package com.rod.rollenia.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"amigos", "amigosConmigo", "partidasComoJugador", "partidasCreadas", "noticiasPublicadas", "sistemasSeguidos"})
    private Usuario emisor;

    @ManyToOne
    @JsonIgnoreProperties({"amigos", "amigosConmigo", "partidasComoJugador", "partidasCreadas", "noticiasPublicadas", "sistemasSeguidos"})
    private Usuario receptor;

    @Column(nullable = false, length = 2000)
    private String contenido;

    private LocalDateTime fechaEnvio;

    private boolean leido;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getEmisor() { return emisor; }
    public void setEmisor(Usuario emisor) { this.emisor = emisor; }

    public Usuario getReceptor() { return receptor; }
    public void setReceptor(Usuario receptor) { this.receptor = receptor; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public boolean isLeido() { return leido; }
    public void setLeido(boolean leido) { this.leido = leido; }
}
