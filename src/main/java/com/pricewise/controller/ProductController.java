package com.pricewise.controller;

import com.pricewise.model.BestBuySearchResponse;
import com.pricewise.model.ProductSearchResponse;
import com.pricewise.service.AmazonService;
import com.pricewise.service.BestBuyService;
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

    @Autowired
    private BestBuyService bestBuyService;

    // ── Amazon ────────────────────────────────────────────────────────────────

    /** GET /api/search?q=laptop */
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

    /** GET /api/product/B08N5WRWNW */
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

    /** GET /api/offers/B08N5WRWNW */
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

    // ── Best Buy ──────────────────────────────────────────────────────────────

    /** GET /api/bestbuy/search?q=iphone */
    @GetMapping("/bestbuy/search")
    public ResponseEntity<?> searchBestBuy(@RequestParam(defaultValue = "best sellers") String q) {
        try {
            BestBuySearchResponse response = bestBuyService.searchProducts(q);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Health ────────────────────────────────────────────────────────────────

    /** GET /api/health */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status",  "UP",
                "service", "PriceWise API",
                "version", "1.0.0",
                "sources", new String[]{"Amazon", "Best Buy"}
        ));
    }
}
