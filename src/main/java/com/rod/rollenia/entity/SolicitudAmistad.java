package com.rod.rollenia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SolicitudAmistad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emisor_id")
    private Usuario usuarioEmisor;

    @ManyToOne
    @JoinColumn(name = "receptor_id")
    private Usuario usuarioReceptor;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    public enum EstadoSolicitud {
        PENDIENTE, ACEPTADA, RECHAZADA
    }

    public SolicitudAmistad() {}

    public SolicitudAmistad(Usuario emisor, Usuario receptor) {
        this.usuarioEmisor = emisor;
        this.usuarioReceptor = receptor;
        this.estado = EstadoSolicitud.PENDIENTE;
        this.fechaSolicitud = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Usuario getUsuarioEmisor() { return usuarioEmisor; }
    public void setUsuarioEmisor(Usuario usuarioEmisor) { this.usuarioEmisor = usuarioEmisor; }
    public Usuario getUsuarioReceptor() { return usuarioReceptor; }
    public void setUsuarioReceptor(Usuario usuarioReceptor) { this.usuarioReceptor = usuarioReceptor; }
    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }
    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }
}
