package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.ReportedPostResponse;
import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.model.PostReport;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.CommentRepository;
import com.genalpha.learningplatform.repository.PostReportRepository;
import com.genalpha.learningplatform.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ModerationServiceImpl implements ModerationService {

    private final PostRepository postRepository;
    private final PostReportRepository postReportRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;
    private final PostService postService;

    public ModerationServiceImpl(PostRepository postRepository,
                                  PostReportRepository postReportRepository,
                                  CommentRepository commentRepository,
                                  UserService userService,
                                  PostService postService) {
        this.postRepository = postRepository;
        this.postReportRepository = postReportRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.postService = postService;
    }

    @Override
    public List<ReportedPostResponse> getReportedPosts() {
        return postRepository.findByReportCountGreaterThan(0).stream().map(post -> {
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
        Post post = postService.getById(postId);
        post.setReportCount(0);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void dismissReports(UUID postId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can dismiss reports");
        }
        Post post = postService.getById(postId);
        int reportCount = post.getReportCount();
        UUID authorId = post.getUserId();
        userService.decrementReportCount(authorId, reportCount);
        post = postService.getById(postId);
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
        Post post = postService.getById(postId);
        postReportRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }
}
