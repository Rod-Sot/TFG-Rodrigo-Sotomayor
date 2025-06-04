package com.rod.rollenia.repository;

import com.rod.rollenia.entity.Foro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForoRepository extends JpaRepository<Foro, Long> {

}
