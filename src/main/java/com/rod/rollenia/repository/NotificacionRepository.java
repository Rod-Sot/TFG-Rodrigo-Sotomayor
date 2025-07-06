package com.rod.rollenia.repository;

import com.rod.rollenia.entity.Notificacion;
import com.rod.rollenia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioAndLeidaFalse(Usuario usuario);
    List<Notificacion> findByUsuarioAndLeidaFalseAndFechaAfter(Usuario usuario, LocalDateTime fecha);
    List<Notificacion> findByUsuarioOrderByFechaDesc(Usuario usuario);
}
