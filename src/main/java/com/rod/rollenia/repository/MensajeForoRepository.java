package com.rod.rollenia.repository;

import com.rod.rollenia.entity.MensajeForo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeForoRepository extends JpaRepository<MensajeForo, Long> {
    List<MensajeForo> findByForoId(Long foroId);
}
