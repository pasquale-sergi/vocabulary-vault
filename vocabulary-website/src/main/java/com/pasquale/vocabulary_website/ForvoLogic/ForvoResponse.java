package com.pasquale.vocabulary_website.ForvoLogic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ForvoResponse {
    private List<ForvoItem> items;

    public List<ForvoItem> getItems() {return items;}
    public void setItems(List<ForvoItem> items) {this.items = items;}
}
