package com.rod.rollenia.service;

import com.rod.rollenia.entity.SolicitudAmistad;
import com.rod.rollenia.entity.Usuario;
import com.rod.rollenia.repository.SolicitudAmistadRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SolicitudAmistadService {

    private final SolicitudAmistadRepository solicitudRepo;

    public SolicitudAmistadService(SolicitudAmistadRepository solicitudRepo) {
        this.solicitudRepo = solicitudRepo;
    }

    public SolicitudAmistad enviarSolicitud(Usuario emisor, Usuario receptor) {
        Optional<SolicitudAmistad> existente = solicitudRepo.findByUsuarioEmisorAndUsuarioReceptor(emisor, receptor);
        if (existente.isPresent()) {
            return existente.get();
        }
        SolicitudAmistad solicitud = new SolicitudAmistad(emisor, receptor);
        return solicitudRepo.save(solicitud);
    }

    public List<SolicitudAmistad> solicitudesRecibidasPendientes(Usuario receptor) {
        return solicitudRepo.findByUsuarioReceptorAndEstado(receptor, SolicitudAmistad.EstadoSolicitud.PENDIENTE);
    }

    public List<SolicitudAmistad> solicitudesEnviadasPendientes(Usuario emisor) {
        return solicitudRepo.findByUsuarioEmisorAndEstado(emisor, SolicitudAmistad.EstadoSolicitud.PENDIENTE);
    }

    public Optional<SolicitudAmistad> obtenerSolicitudPorId(Long id) {
        return solicitudRepo.findById(id);
    }

    public SolicitudAmistad guardar(SolicitudAmistad solicitud) {
        return solicitudRepo.save(solicitud);
    }

    public Optional<SolicitudAmistad> obtenerSolicitudEntreUsuarios(Usuario u1, Usuario u2) {
        return solicitudRepo.findByUsuarioEmisorAndUsuarioReceptor(u1, u2)
            .or(() -> solicitudRepo.findByUsuarioEmisorAndUsuarioReceptor(u2, u1));
    }
}
