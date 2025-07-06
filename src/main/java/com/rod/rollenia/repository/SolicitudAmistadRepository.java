package com.rod.rollenia.repository;
import com.rod.rollenia.entity.SolicitudAmistad;
import com.rod.rollenia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudAmistadRepository extends JpaRepository<SolicitudAmistad, Long> {
    List<SolicitudAmistad> findByUsuarioReceptorAndEstado(Usuario receptor, SolicitudAmistad.EstadoSolicitud estado);
    List<SolicitudAmistad> findByUsuarioEmisorAndEstado(Usuario emisor, SolicitudAmistad.EstadoSolicitud estado);
    Optional<SolicitudAmistad> findByUsuarioEmisorAndUsuarioReceptor(Usuario emisor, Usuario receptor);
    List<SolicitudAmistad> findByUsuarioEmisorOrUsuarioReceptor(Usuario emisor, Usuario receptor);
}
