package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Response DTO for posts that includes author information resolved from the user service.
 */
@Getter
@Setter
public class PostResponse {

    private UUID postId;
    private UUID userId;
    private String title;
    private String category;
    private String picture;
    private String description;
    private Integer reportCount;
    private Integer upvote;
    private String authorName;
    private String authorProfilePic;
}
