// AdminServiceController.java
package com.example.aos_backend.Controller;

import com.example.aos_backend.Service.AdminServiceService;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.dto.CreateServiceRequest;
import com.example.aos_backend.dto.UpdateServiceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@CrossOrigin(origins = { "http://localhost:4201", "*" })
@Validated
public class AdminServiceController {

    @Autowired
    private AdminServiceService adminServiceService;

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServicesForAdmin() {
        try {
            List<ServiceDTO> services = adminServiceService.getAllServicesForAdmin();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        try {
            ServiceDTO service = adminServiceService.getServiceById(id);
            if (service != null) {
                return ResponseEntity.ok(service);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<ServiceDTO> createService(@RequestBody @Validated CreateServiceRequest request) {
        try {
            ServiceDTO createdService = adminServiceService.createService(request);
            return ResponseEntity.ok(createdService);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(@PathVariable Long id,
            @RequestBody @Validated UpdateServiceRequest request) {
        try {
            ServiceDTO updatedService = adminServiceService.updateService(id, request);
            if (updatedService != null) {
                return ResponseEntity.ok(updatedService);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        try {
            boolean deleted = adminServiceService.deleteService(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ServiceDTO> toggleServiceStatus(@PathVariable Long id) {
        try {
            ServiceDTO updatedService = adminServiceService.toggleServiceStatus(id);
            if (updatedService != null) {
                return ResponseEntity.ok(updatedService);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAvailableServiceTypes() {
        List<String> serviceTypes = adminServiceService.getAvailableServiceTypes();
        return ResponseEntity.ok(serviceTypes);
    }
}