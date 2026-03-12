package com.genalpha.learningplatform.dto;

import java.util.UUID;

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

    public UUID getPostId() { return postId; }
    public void setPostId(UUID postId) { this.postId = postId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getReportCount() { return reportCount; }
    public void setReportCount(Integer reportCount) { this.reportCount = reportCount; }
    public Integer getUpvote() { return upvote; }
    public void setUpvote(Integer upvote) { this.upvote = upvote; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorProfilePic() { return authorProfilePic; }
    public void setAuthorProfilePic(String authorProfilePic) { this.authorProfilePic = authorProfilePic; }
}
