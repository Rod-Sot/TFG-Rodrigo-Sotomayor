package com.rod.rollenia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Notificacion {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"amigos", "amigosConmigo", "partidasComoJugador", "partidasCreadas", "noticiasPublicadas", "sistemasSeguidos"})
    private Usuario usuario;

    private String tipo; // "MENSAJE", "PARTIDA_LISTA", "NOTICIA_LIKE", etc.

    private String mensaje; 

    private String url; 

    private LocalDateTime fecha;

    private boolean leida;
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
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }
    public LocalDateTime getFecha() {
        return fecha;
    }
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
    public boolean isLeida() {
        return leida;
    }
    public void setLeida(boolean leida) {
        this.leida = leida;
    }
}
