package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CommentResponse;
import com.genalpha.learningplatform.dto.PostResponse;
import com.genalpha.learningplatform.dto.ReportedPostResponse;
import com.genalpha.learningplatform.model.Comment;
import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.model.PostReport;
import com.genalpha.learningplatform.model.PostUpvote;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.CommentRepository;
import com.genalpha.learningplatform.repository.PostReportRepository;
import com.genalpha.learningplatform.repository.PostRepository;
import com.genalpha.learningplatform.repository.PostUpvoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final PostReportRepository postReportRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    public PostServiceImpl(PostRepository postRepository, PostUpvoteRepository postUpvoteRepository, PostReportRepository postReportRepository, CommentRepository commentRepository, UserService userService) {
        this.postRepository = postRepository;
        this.postUpvoteRepository = postUpvoteRepository;
        this.postReportRepository = postReportRepository;
        this.commentRepository = commentRepository;
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
        r.setCommentCount(commentRepository.countByPostId(post.getPostId()));
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
        if (!userService.isContributorOrAbove(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only contributors and admins can create posts");
        }
        post.setPostId(null);
        post.setUserId(requesterId);
        post.setReportCount(0);
        post.setUpvote(0);
        return postRepository.save(post);
    }

    @Override
    public Post update(UUID postId, Post updates, UUID requesterId) {
        Post post = getById(postId);
        boolean isOwner = post.getUserId().equals(requesterId);
        if (!isOwner || !userService.isContributorOrAbove(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the post owner (contributor+) can edit posts");
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
    public Post report(UUID postId, UUID requesterId, String reason, String description) {
        if (postReportRepository.existsByPostIdAndUserId(postId, requesterId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reported this post");
        }
        PostReport report = new PostReport();
        report.setPostId(postId);
        report.setUserId(requesterId);
        report.setReason(reason);
        report.setDescription(description);
        postReportRepository.save(report);

        Post post = getById(postId);
        post.setReportCount((int) postReportRepository.countByPostId(postId));
        postRepository.save(post);

        // Increment the post author's total report count
        userService.incrementReportCount(post.getUserId());

        return post;
    }

    @Override
    public List<UUID> getReportedPostIds(UUID userId) {
        return postReportRepository.findByUserId(userId)
                .stream().map(PostReport::getPostId).toList();
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
        boolean isOwner = post.getUserId().equals(requesterId);
        if (!isAdmin && (!isOwner || !userService.isContributorOrAbove(requesterId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only contributors and admins can delete posts");
        }
        postRepository.delete(post);
    }

    @Override
    public List<CommentResponse> getComments(UUID postId) {
        getById(postId); // ensure post exists
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream().map(this::toCommentResponse).toList();
    }

    @Override
    public Comment addComment(UUID postId, UUID requesterId, String body) {
        getById(postId); // ensure post exists
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
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit another user's comment");
        }
        comment.setBody(body);
        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(UUID commentId, UUID requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        boolean isAdmin = userService.isAdmin(requesterId);
        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's comment");
        }
        commentRepository.delete(comment);
    }

    @Override
    public List<ReportedPostResponse> getReportedPosts() {
        List<Post> reportedPosts = postRepository.findByReportCountGreaterThan(0);
        return reportedPosts.stream().map(post -> {
            ReportedPostResponse resp = new ReportedPostResponse();
            resp.setPostId(post.getPostId());
            resp.setTitle(post.getTitle());
            resp.setDescription(post.getDescription());
            resp.setPicture(post.getPicture());
            resp.setCategory(post.getCategory());
            resp.setReportCount(post.getReportCount());

            try {
                User author = userService.getById(post.getUserId());
                resp.setAuthorId(author.getUserId());
                resp.setAuthorName(author.getName());
                resp.setAuthorProfilePic(author.getProfilePic());
            } catch (ResponseStatusException ignored) {
                resp.setAuthorName("Unknown");
            }

            List<PostReport> reports = postReportRepository.findByPostId(post.getPostId());
            resp.setReports(reports.stream().map(r -> {
                ReportedPostResponse.ReportDetail detail = new ReportedPostResponse.ReportDetail();
                detail.setReportId(r.getId());
                detail.setReporterId(r.getUserId());
                detail.setReason(r.getReason());
                detail.setDescription(r.getDescription());
                try {
                    User reporter = userService.getById(r.getUserId());
                    detail.setReporterName(reporter.getName());
                } catch (ResponseStatusException ignored) {
                    detail.setReporterName("Unknown");
                }
                return detail;
            }).toList());

            return resp;
        }).toList();
    }

    @Override
    @Transactional
    public void approvePost(UUID postId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can approve posts");
        }
        Post post = getById(postId);
        post.setReportCount(0);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void dismissReports(UUID postId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can dismiss reports");
        }
        Post post = getById(postId);
        int reportCount = post.getReportCount();
        UUID authorId = post.getUserId();
        // Decrement author's report count first (JPQL clears persistence context)
        userService.decrementReportCount(authorId, reportCount);
        // Re-fetch post after context clear, then delete reports and reset count
        post = getById(postId);
        postReportRepository.deleteByPostId(postId);
        post.setReportCount(0);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void deleteReportedPost(UUID postId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete reported posts");
        }
        Post post = getById(postId);
        postReportRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
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
