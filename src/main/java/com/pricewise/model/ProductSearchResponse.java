package com.pricewise.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductSearchResponse {

    @JsonProperty("status")
    private String status;

    @JsonProperty("data")
    private SearchData data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SearchData {

        @JsonProperty("total_products")
        private Integer totalProducts;

        @JsonProperty("country")
        private String country;

        @JsonProperty("products")
        private List<Product> products;
    }
}
