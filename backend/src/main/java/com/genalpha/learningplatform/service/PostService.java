package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CommentResponse;
import com.genalpha.learningplatform.dto.PostResponse;
import com.genalpha.learningplatform.dto.ReportedPostResponse;
import com.genalpha.learningplatform.model.Comment;
import com.genalpha.learningplatform.model.Post;
import java.util.List;
import java.util.UUID;

/**
 * Defines community post management operations for the learning platform.
 */
public interface PostService {
    List<Post> getAll();
    List<PostResponse> getAllWithAuthor();
    Post getById(UUID postId);
    PostResponse getByIdWithAuthor(UUID postId);
    List<Post> getByUser(UUID userId);
    Post create(Post post, UUID requesterId);
    Post update(UUID postId, Post updates, UUID requesterId);
    Post upvote(UUID postId, UUID requesterId);
    List<UUID> getUpvotedPostIds(UUID userId);
    Post report(UUID postId, UUID requesterId, String reason, String description);
    List<UUID> getReportedPostIds(UUID userId);
    void delete(UUID postId, UUID requesterId);
    List<CommentResponse> getComments(UUID postId);
    Comment addComment(UUID postId, UUID requesterId, String body);
    Comment updateComment(UUID commentId, String body, UUID requesterId);
    void deleteComment(UUID commentId, UUID requesterId);
    List<ReportedPostResponse> getReportedPosts();
    void approvePost(UUID postId, UUID requesterId);
    void dismissReports(UUID postId, UUID requesterId);
    void deleteReportedPost(UUID postId, UUID requesterId);
}
