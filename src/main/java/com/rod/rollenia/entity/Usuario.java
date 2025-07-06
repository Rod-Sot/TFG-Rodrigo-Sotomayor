package com.rod.rollenia.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombreUsuario;

    @Column(nullable = false, unique = true)
    private String email;
    private String password;
    private String avatarUrl = "standard_pfp.png";
    private LocalDate fechaRegistro;
    private String rol; // valores: "USER", "USER_NEWS", "ADMIN", "OWNER"
    private boolean baneado = false; // Indica si el usuario está baneado
    // Relaciones
    @OneToMany(mappedBy = "autor")
    @JsonIgnoreProperties("autor")
    private List<Noticia> noticiasPublicadas = new ArrayList<>();

    @OneToMany(mappedBy = "creador")
    @JsonIgnoreProperties("creador")
    private List<Partida> partidasCreadas = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "usuario_sistemas_seguidos",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "sistema_id")
    )
    private Set<SistemaJuego> sistemasSeguidos = new HashSet<>();

    @ManyToMany(mappedBy = "jugadores")
    @JsonIgnoreProperties("jugadores")
    private List<Partida> partidasComoJugador = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "usuario_amigos",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "amigo_id")
    )
    @JsonIgnoreProperties("amigosConmigo")
    private Set<Usuario> amigos = new HashSet<>();

    @ManyToMany(mappedBy = "amigos")
    @JsonIgnoreProperties("amigos")
    private Set<Usuario> amigosConmigo = new HashSet<>();

    @Column(length = 1000)
    private String biografia = "Escribe aquí tu biografía...";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public List<Noticia> getNoticiasPublicadas() {
        return noticiasPublicadas;
    }

    public void setNoticiasPublicadas(List<Noticia> noticiasPublicadas) {
        this.noticiasPublicadas = noticiasPublicadas;
    }

    public List<Partida> getPartidasCreadas() {
        return partidasCreadas;
    }

    public void setPartidasCreadas(List<Partida> partidasCreadas) {
        this.partidasCreadas = partidasCreadas;
    }

    public Set<SistemaJuego> getSistemasSeguidos() {
        return sistemasSeguidos;
    }

    public void setSistemasSeguidos(Set<SistemaJuego> sistemasSeguidos) {
        this.sistemasSeguidos = sistemasSeguidos;
    }

    public boolean getBaneado(){
        return baneado;
    }
    public void setBaneado(boolean baneado) {
        this.baneado = baneado;
    }

    public List<Partida> getPartidasComoJugador() {
        return partidasComoJugador;
    }

    public void setPartidasComoJugador(List<Partida> partidasComoJugador) {
        this.partidasComoJugador = partidasComoJugador;
    }

    public Set<Usuario> getAmigos() {
        return amigos;
    }

    public void setAmigos(Set<Usuario> amigos) {
        this.amigos = amigos;
    }

    public Set<Usuario> getAmigosConmigo() {
        return amigosConmigo;
    }

    public void setAmigosConmigo(Set<Usuario> amigosConmigo) {
        this.amigosConmigo = amigosConmigo;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public Usuario() {
    }

    public Usuario(String nombreUsuario, String email, String password, String avatarUrl, LocalDate fechaRegistro) {
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.password = password;
        this.avatarUrl = avatarUrl;
        this.fechaRegistro = fechaRegistro;
    }

    public Usuario(Long id, String nombreUsuario, String email, String password, String avatarUrl, LocalDate fechaRegistro) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.password = password;
        this.avatarUrl = avatarUrl;
        this.fechaRegistro = fechaRegistro;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nombreUsuario='" + nombreUsuario + '\'' +
                ", email='" + email + '\'' +
                ", avatarUrl='" + avatarUrl + '\'' +
                ", fechaRegistro=" + fechaRegistro +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return id != null && id.equals(usuario.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

