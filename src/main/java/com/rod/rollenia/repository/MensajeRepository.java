package com.rod.rollenia.repository;

import com.rod.rollenia.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvioAsc(
        Long emisorId, Long receptorId, Long receptorId2, Long emisorId2
    );
}
