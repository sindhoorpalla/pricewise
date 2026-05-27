package com.pricewise.model;

public class TargetProduct {
    private String  tcin;
    private String  title;
    private Double  price;
    private String  formattedPrice;
    private String  imageUrl;
    private String  buyUrl;
    private Double  rating;
    private Integer reviewCount;

    public String  getTcin()           { return tcin; }
    public void    setTcin(String v)   { this.tcin = v; }

    public String  getTitle()          { return title; }
    public void    setTitle(String v)  { this.title = v; }

    public Double  getPrice()          { return price; }
    public void    setPrice(Double v)  { this.price = v; }

    public String  getFormattedPrice()         { return formattedPrice; }
    public void    setFormattedPrice(String v) { this.formattedPrice = v; }

    public String  getImageUrl()         { return imageUrl; }
    public void    setImageUrl(String v) { this.imageUrl = v; }

    public String  getBuyUrl()         { return buyUrl; }
    public void    setBuyUrl(String v) { this.buyUrl = v; }

    public Double  getRating()          { return rating; }
    public void    setRating(Double v)  { this.rating = v; }

    public Integer getReviewCount()          { return reviewCount; }
    public void    setReviewCount(Integer v) { this.reviewCount = v; }
}
