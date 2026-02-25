package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    public PostService(PostRepository postRepository, UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
    }

    public List<Post> getAll() {
        return postRepository.findAll();
    }

    public Post getById(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public List<Post> getByUser(UUID userId) {
        return postRepository.findByUserId(userId);
    }

    public Post create(Post post, UUID requesterId) {
        if (!userService.isAdmin(requesterId) && !userService.isCollaborator(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only collaborators and admins can create posts");
        }
        post.setPostId(null);
        post.setUserId(requesterId);
        post.setReportCount(0);
        post.setUpvote(0);
        return postRepository.save(post);
    }

    public Post update(UUID postId, Post updates, UUID requesterId) {
        Post post = getById(postId);
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !post.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit another user's post");
        }
        if (updates.getPicture() != null) post.setPicture(updates.getPicture());
        if (updates.getDescription() != null) post.setDescription(updates.getDescription());
        return postRepository.save(post);
    }

    public void delete(UUID postId, UUID requesterId) {
        Post post = getById(postId);
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !post.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's post");
        }
        postRepository.delete(post);
    }
}
