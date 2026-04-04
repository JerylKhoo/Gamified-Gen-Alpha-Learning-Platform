package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CommentResponse;
import com.genalpha.learningplatform.model.Comment;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.CommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;

    public CommentServiceImpl(CommentRepository commentRepository,
                               PostService postService,
                               UserService userService) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.userService = userService;
    }

    @Override
    public List<CommentResponse> getComments(UUID postId) {
        postService.getById(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream().map(this::toCommentResponse).toList();
    }

    @Override
    public Comment addComment(UUID postId, UUID requesterId, String body) {
        postService.getById(postId);
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(requesterId);
        comment.setBody(body);
        return commentRepository.save(comment);
    }

    @Override
    public Comment updateComment(UUID commentId, String body, UUID requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!userService.isAdmin(requesterId) && !comment.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit another user's comment");
        }
        comment.setBody(body);
        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(UUID commentId, UUID requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!userService.isAdmin(requesterId) && !comment.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's comment");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toCommentResponse(Comment comment) {
        CommentResponse r = new CommentResponse();
        r.setCommentId(comment.getCommentId());
        r.setPostId(comment.getPostId());
        r.setUserId(comment.getUserId());
        r.setBody(comment.getBody());
        r.setCreatedAt(comment.getCreatedAt());
        try {
            User author = userService.getById(comment.getUserId());
            r.setAuthorName(author.getName());
            r.setAuthorProfilePic(author.getProfilePic());
        } catch (ResponseStatusException ignored) {
            r.setAuthorName("Unknown");
        }
        return r;
    }
}
