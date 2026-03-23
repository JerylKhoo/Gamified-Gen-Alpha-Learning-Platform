package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.PostResponse;
import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.model.PostUpvote;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.PostRepository;
import com.genalpha.learningplatform.repository.PostUpvoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Concrete implementation of PostService backed by JPA.
 */
@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostUpvoteRepository postUpvoteRepository;
    private final UserService userService;

    public PostServiceImpl(PostRepository postRepository, PostUpvoteRepository postUpvoteRepository, UserService userService) {
        this.postRepository = postRepository;
        this.postUpvoteRepository = postUpvoteRepository;
        this.userService = userService;
    }

    @Override
    public List<Post> getAll() {
        return postRepository.findAll();
    }

    @Override
    public List<PostResponse> getAllWithAuthor() {
        return postRepository.findAll().stream().map(this::toResponse).toList();
    }

    private PostResponse toResponse(Post post) {
        PostResponse r = new PostResponse();
        r.setPostId(post.getPostId());
        r.setUserId(post.getUserId());
        r.setTitle(post.getTitle());
        r.setCategory(post.getCategory());
        r.setPicture(post.getPicture());
        r.setDescription(post.getDescription());
        r.setReportCount(post.getReportCount());
        r.setUpvote(post.getUpvote());
        try {
            User author = userService.getById(post.getUserId());
            r.setAuthorName(author.getName());
            r.setAuthorProfilePic(author.getProfilePic());
        } catch (ResponseStatusException ignored) {
            r.setAuthorName("Unknown");
        }
        return r;
    }

    @Override
    public Post getById(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    @Override
    public PostResponse getByIdWithAuthor(UUID postId) {
        return toResponse(getById(postId));
    }

    @Override
    public List<Post> getByUser(UUID userId) {
        return postRepository.findByUserId(userId);
    }

    @Override
    public Post create(Post post, UUID requesterId) {
        post.setPostId(null);
        post.setUserId(requesterId);
        post.setReportCount(0);
        post.setUpvote(0);
        return postRepository.save(post);
    }

    @Override
    public Post update(UUID postId, Post updates, UUID requesterId) {
        Post post = getById(postId);
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !post.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit another user's post");
        }
        if (updates.getPicture() != null)     post.setPicture(updates.getPicture());
        if (updates.getDescription() != null) post.setDescription(updates.getDescription());
        if (updates.getTitle() != null)       post.setTitle(updates.getTitle());
        if (updates.getCategory() != null)    post.setCategory(updates.getCategory());
        return postRepository.save(post);
    }

    @Override
    public Post upvote(UUID postId, UUID requesterId) {
        Post post = getById(postId);
        var existing = postUpvoteRepository.findByPostIdAndUserId(postId, requesterId);
        if (existing.isPresent()) {
            // Already upvoted — remove upvote (toggle off)
            postUpvoteRepository.delete(existing.get());
            post.setUpvote(Math.max(0, post.getUpvote() - 1));
        } else {
            // Not upvoted — add upvote (toggle on)
            PostUpvote upvoteRecord = new PostUpvote();
            upvoteRecord.setPostId(postId);
            upvoteRecord.setUserId(requesterId);
            postUpvoteRepository.save(upvoteRecord);
            post.setUpvote(post.getUpvote() + 1);
        }
        return postRepository.save(post);
    }

    @Override
    public Post report(UUID postId) {
        Post post = getById(postId);
        post.setReportCount((post.getReportCount() == null ? 0 : post.getReportCount()) + 1);
        return postRepository.save(post);
    }

    @Override
    public List<UUID> getUpvotedPostIds(UUID userId) {
        return postUpvoteRepository.findByUserId(userId)
                .stream().map(PostUpvote::getPostId).toList();
    }

    @Override
    public void delete(UUID postId, UUID requesterId) {
        Post post = getById(postId);
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !post.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's post");
        }
        postRepository.delete(post);
    }
}
