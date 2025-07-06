package com.rod.rollenia.dto;

import java.time.LocalDate;

public class UsuarioPublicoDTO {
    private Long id;
    private String nombreUsuario;
    private String avatarUrl;
    private String biografia;
    private LocalDate fechaRegistro;

    public UsuarioPublicoDTO(Long id, String nombreUsuario, String avatarUrl, String biografia, LocalDate fechaRegistro) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.avatarUrl = avatarUrl;
        this.biografia = biografia;
        this.fechaRegistro = fechaRegistro;
    }

    public Long getId() { return id; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getBiografia() { return biografia; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }

    public void setId(Long id) { this.id = id; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setBiografia(String biografia) { this.biografia = biografia; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
