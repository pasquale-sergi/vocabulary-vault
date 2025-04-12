package com.pasquale.vocabulary_website.Utils;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private int id;
    private String username;
    private String email;

    public JwtResponse(String accessToken, int id, String username, String email) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;

    }
}
