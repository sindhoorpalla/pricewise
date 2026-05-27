package com.pricewise.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BestBuySearchResponse {

    @JsonProperty("products")
    private List<BestBuyProduct> products;

    @JsonProperty("total")
    private Integer total;

    public List<BestBuyProduct> getProducts() { return products; }
    public void setProducts(List<BestBuyProduct> products) { this.products = products; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
}
