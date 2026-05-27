package com.pricewise.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BestBuyProduct {

    @JsonProperty("sku")
    private String sku;

    @JsonProperty("name")
    private String name;

    @JsonProperty("regularPrice")
    private Double regularPrice;

    @JsonProperty("salePrice")
    private Double salePrice;

    @JsonProperty("image")
    private String image;

    @JsonProperty("url")
    private String url;

    @JsonProperty("customerReviewAverage")
    private Double customerReviewAverage;

    @JsonProperty("customerReviewCount")
    private Integer customerReviewCount;

    @JsonProperty("inStoreAvailability")
    private Boolean inStoreAvailability;

    @JsonProperty("onlineAvailability")
    private Boolean onlineAvailability;

    @JsonProperty("shortDescription")
    private String shortDescription;

    @JsonProperty("categoryPath")
    private String categoryPath;
}
