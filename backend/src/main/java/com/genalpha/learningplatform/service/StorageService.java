package com.genalpha.learningplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> listAvatarUrls() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", "Bearer " + supabaseAnonKey);

        Map<String, Object> body = Map.of(
                "prefix", "",
                "limit", 100,
                "offset", 0,
                "sortBy", Map.of("column", "name", "order", "asc")
        );

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                supabaseUrl + "/storage/v1/object/list/avatars",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {}
        );

        List<Map<String, Object>> objects = response.getBody();
        if (objects == null) return List.of();

        return objects.stream()
                .map(obj -> (String) obj.get("name"))
                .filter(name -> name != null && !name.isBlank())
                .map(name -> supabaseUrl + "/storage/v1/object/public/avatars/" + name)
                .toList();
    }
}
