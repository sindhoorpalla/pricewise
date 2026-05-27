package com.pricewise.controller;

import com.pricewise.model.BestBuySearchResponse;
import com.pricewise.model.ProductSearchResponse;
import com.pricewise.model.TargetProduct;
import com.pricewise.service.AmazonService;
import com.pricewise.service.BestBuyService;
import com.pricewise.service.TargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired private AmazonService  amazonService;
    @Autowired private BestBuyService bestBuyService;
    @Autowired private TargetService  targetService;

    // ── Amazon ────────────────────────────────────────────────────────────────

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam(defaultValue = "best sellers") String q) {
        try {
            return ResponseEntity.ok(amazonService.searchProducts(q));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/product/{asin}")
    public ResponseEntity<?> getProductDetails(@PathVariable String asin) {
        try {
            return ResponseEntity.ok(amazonService.getProductDetails(asin));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/offers/{asin}")
    public ResponseEntity<?> getProductOffers(@PathVariable String asin) {
        try {
            return ResponseEntity.ok(amazonService.getProductOffers(asin));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Best Buy ──────────────────────────────────────────────────────────────

    @GetMapping("/bestbuy/search")
    public ResponseEntity<?> searchBestBuy(@RequestParam(defaultValue = "best sellers") String q) {
        try {
            return ResponseEntity.ok(bestBuyService.searchProducts(q));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Target ────────────────────────────────────────────────────────────────

    /** GET /api/target/search?q=iphone  — keyword → curated TCINs → prices */
    @GetMapping("/target/search")
    public ResponseEntity<?> searchTarget(@RequestParam(defaultValue = "best sellers") String q) {
        try {
            List<TargetProduct> products = targetService.searchByKeyword(q);
            return ResponseEntity.ok(Map.of("products", products));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/target/product?tcin=86822324  — direct TCIN lookup */
    @GetMapping("/target/product")
    public ResponseEntity<?> getTargetProduct(@RequestParam String tcin) {
        try {
            TargetProduct product = targetService.getProductByTcin(tcin);
            if (product == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status",  "UP",
                "service", "PriceWise API",
                "version", "1.0.0",
                "sources", new String[]{"Amazon", "Best Buy", "Target"}
        ));
    }
}
