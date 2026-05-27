package com.pricewise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pricewise.model.BestBuyProduct;
import com.pricewise.model.BestBuySearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class BestBuyService {

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    private static final String HOST     = "bestbuy-product-data-api.p.rapidapi.com";
    private static final String BASE_URL = "https://" + HOST + "/bestbuy/";

    private final HttpClient   httpClient   = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Cacheable(value = "bestbuy", key = "#keyword")
    public BestBuySearchResponse searchProducts(String keyword) throws Exception {
        String url = BASE_URL + "?page=1&keyword="
                + URLEncoder.encode(keyword, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-rapidapi-host", HOST)
                .header("x-rapidapi-key", rapidApiKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("BestBuy API error: "
                    + response.statusCode() + " - " + response.body());
        }

        return parseResponse(response.body());
    }

    /**
     * Handles array-root, "products"-wrapped, and "data"-wrapped API shapes.
     */
    private BestBuySearchResponse parseResponse(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        List<BestBuyProduct> products = new ArrayList<>();

        JsonNode arrayNode = null;
        if (root.isArray()) {
            arrayNode = root;
        } else if (root.has("products") && root.get("products").isArray()) {
            arrayNode = root.get("products");
        } else if (root.has("data") && root.get("data").isArray()) {
            arrayNode = root.get("data");
        }

        if (arrayNode != null) {
            for (JsonNode node : arrayNode) {
                products.add(objectMapper.treeToValue(node, BestBuyProduct.class));
            }
        }

        // Build response manually to avoid Lombok processing issues
        BestBuySearchResponse resp = new BestBuySearchResponse();
        resp.setProducts(products);
        resp.setTotal(products.size());
        return resp;
    }
}
