package com.timizerlike.backend.cra.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.CraDeleteService;

@RestController
@RequestMapping("/api/cras/{id}")
public class CraDeleteController {

    private final CraDeleteService deleteService;

    public CraDeleteController(CraDeleteService deleteService) {
        this.deleteService = deleteService;
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deleteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
