package com.shopcart.controller;

import com.shopcart.dto.request.InventoryCheckRequest;
import com.shopcart.dto.response.InventoryCheckResponse;
import com.shopcart.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/check")
    public ResponseEntity<InventoryCheckResponse> checkAvailability(@RequestBody InventoryCheckRequest request) {
        return ResponseEntity.ok(inventoryService.checkAvailability(request));
    }
}
