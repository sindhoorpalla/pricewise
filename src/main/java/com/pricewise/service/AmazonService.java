package com.pricewise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pricewise.model.ProductSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AmazonService {

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    private static final String HOST = "real-time-amazon-data.p.rapidapi.com";
    private static final String BASE_URL = "https://" + HOST;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Cacheable(value = "products", key = "#query")
    public ProductSearchResponse searchProducts(String query) throws Exception {
        String url = BASE_URL + "/search?query=" + java.net.URLEncoder.encode(query, "UTF-8")
                + "&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-rapidapi-host", HOST)
                .header("x-rapidapi-key", rapidApiKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("API error: " + response.statusCode() + " - " + response.body());
        }

        return objectMapper.readValue(response.body(), ProductSearchResponse.class);
    }

    @Cacheable(value = "products", key = "#asin")
    public String getProductDetails(String asin) throws Exception {
        String url = BASE_URL + "/product-details?asin=" + asin + "&country=US";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-rapidapi-host", HOST)
                .header("x-rapidapi-key", rapidApiKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    @Cacheable(value = "offers", key = "#asin")
    public String getProductOffers(String asin) throws Exception {
        String url = BASE_URL + "/product-offers?asin=" + asin + "&country=US&limit=10";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-rapidapi-host", HOST)
                .header("x-rapidapi-key", rapidApiKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
