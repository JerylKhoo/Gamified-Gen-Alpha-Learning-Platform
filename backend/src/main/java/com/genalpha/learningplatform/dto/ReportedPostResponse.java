package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ReportedPostResponse {
    private UUID postId;
    private String title;
    private String description;
    private String picture;
    private String category;
    private int reportCount;

    // Author info
    private UUID authorId;
    private String authorName;
    private String authorProfilePic;

    // All reports on this post
    private List<ReportDetail> reports;

    @Getter
    @Setter
    public static class ReportDetail {
        private UUID reportId;
        private UUID reporterId;
        private String reporterName;
        private String reason;
        private String description;
    }
}
