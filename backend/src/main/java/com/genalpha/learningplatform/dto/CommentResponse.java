package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CommentResponse {
    private UUID commentId;
    private UUID postId;
    private UUID userId;
    private String body;
    private Instant createdAt;
    private String authorName;
    private String authorProfilePic;
}
