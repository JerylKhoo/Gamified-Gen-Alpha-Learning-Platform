package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.ReportedPostResponse;

import java.util.List;
import java.util.UUID;

public interface ModerationService {
    List<ReportedPostResponse> getReportedPosts();
    void approvePost(UUID postId, UUID requesterId);
    void dismissReports(UUID postId, UUID requesterId);
    void deleteReportedPost(UUID postId, UUID requesterId);
}
