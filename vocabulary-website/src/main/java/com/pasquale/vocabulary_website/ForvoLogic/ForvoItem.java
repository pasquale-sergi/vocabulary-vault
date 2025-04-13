package com.pasquale.vocabulary_website.ForvoLogic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ForvoItem {
    @JsonProperty("pathmp3")
    private String pathmp3;

    public String getPathMp3() {return pathmp3;}
    public void setPathMp3(String pathmp3) {this.pathmp3 = pathmp3;}
}
