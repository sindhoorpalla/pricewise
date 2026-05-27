package com.pricewise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pricewise.model.TargetProduct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class TargetService {

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    private static final String HOST     = "target-com-shopping-api.p.rapidapi.com";
    private static final String BASE_URL = "https://" + HOST;

    // Default location params (Bay Area, CA)
    private static final String STORE_ID  = "3380";
    private static final String ZIP       = "94611";
    private static final String STATE     = "CA";
    private static final String LATITUDE  = "37.820";
    private static final String LONGITUDE = "-122.200";

    private final HttpClient   httpClient   = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Curated map: search keyword → list of Target TCINs.
     * Add more TCINs here as needed — these are real Target product IDs.
     */
    private static final Map<String, List<String>> KEYWORD_TCIN_MAP = new LinkedHashMap<>();
    static {
        KEYWORD_TCIN_MAP.put("iphone",         List.of("89765432", "86564733", "89765433"));
        KEYWORD_TCIN_MAP.put("ipad",            List.of("86564057", "86564058"));
        KEYWORD_TCIN_MAP.put("airpods",         List.of("85978522", "85978523"));
        KEYWORD_TCIN_MAP.put("macbook",         List.of("89207900", "89207901"));
        KEYWORD_TCIN_MAP.put("samsung tv",      List.of("89028439", "89028440"));
        KEYWORD_TCIN_MAP.put("tv",              List.of("89028439", "89028440", "85214735"));
        KEYWORD_TCIN_MAP.put("laptop",          List.of("89207900", "86041337"));
        KEYWORD_TCIN_MAP.put("headphones",      List.of("85978522", "83912042"));
        KEYWORD_TCIN_MAP.put("speaker",         List.of("83912042", "85214735"));
        KEYWORD_TCIN_MAP.put("vacuum",          List.of("83193810", "80553620"));
        KEYWORD_TCIN_MAP.put("instant pot",     List.of("52636328"));
        KEYWORD_TCIN_MAP.put("kitchenaid",      List.of("13803330"));
        KEYWORD_TCIN_MAP.put("best sellers",    List.of("86822324", "13803330", "52636328"));
        KEYWORD_TCIN_MAP.put("phone",           List.of("89765432", "86564733"));
        KEYWORD_TCIN_MAP.put("gaming",          List.of("83912042", "85214735"));
        KEYWORD_TCIN_MAP.put("home appliances", List.of("13803330", "52636328", "83193810"));
        KEYWORD_TCIN_MAP.put("smart tv",        List.of("89028439", "89028440"));
        KEYWORD_TCIN_MAP.put("audio",           List.of("85978522", "83912042"));
    }

    /**
     * Lookup Target products by keyword using the curated TCIN map.
     * Returns up to 3 products for a given search term.
     */
    @Cacheable(value = "target", key = "#keyword")
    public List<TargetProduct> searchByKeyword(String keyword) {
        String lowerKey = keyword.toLowerCase();

        // Find best matching key in the map
        List<String> tcins = KEYWORD_TCIN_MAP.entrySet().stream()
                .filter(e -> lowerKey.contains(e.getKey()) || e.getKey().contains(lowerKey))
                .findFirst()
                .map(Map.Entry::getValue)
                .orElse(List.of());

        List<TargetProduct> results = new ArrayList<>();
        for (String tcin : tcins) {
            try {
                TargetProduct p = getProductByTcin(tcin);
                if (p != null) results.add(p);
            } catch (Exception ignored) {
                // Skip products that fail — don't break the whole search
            }
        }
        return results;
    }

    /**
     * Fetch a single product by TCIN.
     */
    @Cacheable(value = "target", key = "#tcin")
    public TargetProduct getProductByTcin(String tcin) throws Exception {
        String url = BASE_URL + "/product_details?tcin=" + tcin
                + "&longitude=" + LONGITUDE
                + "&latitude=" + LATITUDE
                + "&store_id=" + STORE_ID
                + "&zip=" + ZIP
                + "&state=" + STATE;

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
            throw new RuntimeException("Target API error: " + response.statusCode());
        }

        return parseProduct(response.body(), tcin);
    }

    // ── Parser ────────────────────────────────────────────────────────────────

    private TargetProduct parseProduct(String body, String requestedTcin) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode product = root.path("data").path("product");
        if (product.isMissingNode()) return null;

        JsonNode item  = product.path("item");
        JsonNode price = product.path("price");
        JsonNode rar   = product.path("ratings_and_reviews").path("statistics").path("rating");

        TargetProduct p = new TargetProduct();
        p.setTcin(product.path("tcin").asText(requestedTcin));

        // Title
        String title = item.path("product_description").path("title").asText("");
        p.setTitle(title.isEmpty() ? "Target Product" : title);

        // Price
        String formatted = price.path("formatted_current_price").asText("");
        double priceVal  = price.path("current_retail_min").asDouble(
                           price.path("reg_retail_max").asDouble(0));
        p.setFormattedPrice(formatted.isEmpty() ? null : formatted);
        p.setPrice(priceVal > 0 ? priceVal : null);

        // Image
        String imgUrl = item.path("enrichment").path("image_info")
                           .path("primary_image").path("url").asText("");
        p.setImageUrl(imgUrl.isEmpty() ? null : imgUrl);

        // Buy URL
        String buyUrl = item.path("enrichment").path("buy_url").asText("");
        p.setBuyUrl(buyUrl.isEmpty() ? null : buyUrl);

        // Rating
        double rating = rar.path("mean").asDouble(0);
        int    count  = rar.path("count").asInt(0);
        if (rating > 0) { p.setRating(rating); p.setReviewCount(count); }

        return p;
    }
}
