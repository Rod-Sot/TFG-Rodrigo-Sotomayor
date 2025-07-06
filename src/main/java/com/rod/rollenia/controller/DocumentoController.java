package com.rod.rollenia.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.rod.rollenia.entity.Documento;
import com.rod.rollenia.service.DocumentoService;
import com.rod.rollenia.service.NotificacionService;
import com.rod.rollenia.entity.Usuario;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;
    private final NotificacionService notificacionService;

    public DocumentoController(DocumentoService documentoService, NotificacionService notificacionService) {
        this.documentoService = documentoService;
        this.notificacionService = notificacionService;
    }

    @PostMapping
    public ResponseEntity<Documento> crearDocumento(@RequestBody Documento documento) {
        Documento nuevoDocumento = documentoService.crearDocumento(documento);

        // Notificar a los seguidores
        if (documento.getSistema() != null && documento.getSistema().getSeguidores() != null) {
            for (Usuario seguidor : documento.getSistema().getSeguidores()) {
                notificacionService.crearNotificacion(
                    seguidor,
                    "DOCUMENTO_NUEVO_SISTEMA",
                    "Se ha añadido un nuevo documento al sistema '" + documento.getSistema().getNombre() + "': " + documento.getTitulo(),
                    "/sistema_detail?sistemaId=" + nuevoDocumento.getId()
                );
            }
        }

        return new ResponseEntity<>(nuevoDocumento, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Documento> obtenerDocumentoPorId(@PathVariable Long id) {
        Optional<Documento> documento = documentoService.obtenerDocumentoPorId(id);
        return documento.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Documento> listarDocumentos() {
        return documentoService.listarDocumentos();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Documento> actualizarDocumento(@PathVariable Long id, @RequestBody Documento documentoActualizado) {
        try {
            Documento documento = documentoService.actualizarDocumento(id, documentoActualizado);
            return ResponseEntity.ok(documento);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDocumento(@PathVariable Long id) {
        try {
            documentoService.eliminarDocumento(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
