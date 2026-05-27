package com.pricewise.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Product {

    @JsonProperty("asin")
    private String asin;

    @JsonProperty("product_title")
    private String title;

    @JsonProperty("product_price")
    private String price;

    @JsonProperty("product_original_price")
    private String originalPrice;

    @JsonProperty("product_star_rating")
    private String starRating;

    @JsonProperty("product_num_ratings")
    private Integer numRatings;

    @JsonProperty("product_photo")
    private String photoUrl;

    @JsonProperty("product_url")
    private String productUrl;

    @JsonProperty("is_prime")
    private Boolean isPrime;

    @JsonProperty("product_badge")
    private String badge;

    @JsonProperty("sales_volume")
    private String salesVolume;
}
