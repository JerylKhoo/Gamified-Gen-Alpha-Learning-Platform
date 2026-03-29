package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class AdminUserResponse {
    private UUID userId;
    private String name;
    private Integer points;
    private String profilePic;
    private String role;
    private long reportCount;
}
