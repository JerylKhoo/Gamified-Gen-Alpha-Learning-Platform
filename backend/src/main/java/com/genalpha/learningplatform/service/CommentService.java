package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CommentResponse;
import com.genalpha.learningplatform.model.Comment;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    List<CommentResponse> getComments(UUID postId);
    Comment addComment(UUID postId, UUID requesterId, String body);
    Comment updateComment(UUID commentId, String body, UUID requesterId);
    void deleteComment(UUID commentId, UUID requesterId);
}
