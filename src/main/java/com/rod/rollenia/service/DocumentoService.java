package com.rod.rollenia.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rod.rollenia.entity.Documento;
import com.rod.rollenia.entity.SistemaJuego;
import com.rod.rollenia.repository.DocumentoRepository;
import com.rod.rollenia.repository.SistemaJuegoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;

    @Autowired
    private SistemaJuegoRepository sistemaJuegoRepository;

    public DocumentoService(DocumentoRepository documentoRepository) {
        this.documentoRepository = documentoRepository;
    }

    public Documento crearDocumento(Documento documento) {
        if (documento.getSistema() != null && documento.getSistema().getId() != null) {
            SistemaJuego sistema = sistemaJuegoRepository.findById(documento.getSistema().getId())
                .orElseThrow(() -> new IllegalArgumentException("Sistema no encontrado"));
            documento.setSistema(sistema);
        }
        return documentoRepository.save(documento);
    }

    public Optional<Documento> obtenerDocumentoPorId(Long id) {
        return documentoRepository.findById(id);
    }

    public List<Documento> listarDocumentos() {
        return documentoRepository.findAll();
    }

    public Documento actualizarDocumento(Long id, Documento documentoActualizado) {
        return documentoRepository.findById(id).map(documento -> {
            documento.setTitulo(documentoActualizado.getTitulo());
            documento.setUrlInfo(documentoActualizado.getUrlInfo());
            documento.setTipo(documentoActualizado.getTipo());
            if (documentoActualizado.getSistema() != null && documentoActualizado.getSistema().getId() != null) {
                SistemaJuego sistema = sistemaJuegoRepository.findById(documentoActualizado.getSistema().getId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Sistema no encontrado"));
                documento.setSistema(sistema);
            } else {
                documento.setSistema(null);
            }

            return documentoRepository.save(documento);
        }).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Documento no encontrado con ID: " + id));
    }

    public void eliminarDocumento(Long id) {
        if (!documentoRepository.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Documento no encontrado con ID: " + id);
        }
        documentoRepository.deleteById(id);
    }
}
