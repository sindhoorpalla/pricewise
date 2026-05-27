package com.pricewise.controller;

import com.pricewise.model.ProductSearchResponse;
import com.pricewise.service.AmazonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private AmazonService amazonService;

    /**
     * Search products by keyword
     * GET /api/search?q=laptop
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam(defaultValue = "best sellers") String q) {
        try {
            ProductSearchResponse response = amazonService.searchProducts(q);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get product details by ASIN
     * GET /api/product/B08N5WRWNW
     */
    @GetMapping("/product/{asin}")
    public ResponseEntity<?> getProductDetails(@PathVariable String asin) {
        try {
            String details = amazonService.getProductDetails(asin);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get product offers/prices by ASIN
     * GET /api/offers/B08N5WRWNW
     */
    @GetMapping("/offers/{asin}")
    public ResponseEntity<?> getProductOffers(@PathVariable String asin) {
        try {
            String offers = amazonService.getProductOffers(asin);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Health check
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "PriceWise API",
            "version", "1.0.0"
        ));
    }
}
