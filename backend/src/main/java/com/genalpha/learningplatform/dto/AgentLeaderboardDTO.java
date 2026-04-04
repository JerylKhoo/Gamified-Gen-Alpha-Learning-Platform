package com.genalpha.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentLeaderboardDTO {
    private UUID userId;
    private String name;
    private String profilePic;
    private Integer agentScore;
}
