package com.genalpha.learningplatform.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    private String picture;
    private String description;

    @Column(name = "report_count")
    private Integer reportCount = 0;

    private Integer upvote = 0;

    public UUID getPostId() { return postId; }
    public void setPostId(UUID postId) { this.postId = postId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getReportCount() { return reportCount; }
    public void setReportCount(Integer reportCount) { this.reportCount = reportCount; }
    public Integer getUpvote() { return upvote; }
    public void setUpvote(Integer upvote) { this.upvote = upvote; }
}
