package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PostReportRepository extends JpaRepository<PostReport, UUID> {
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    List<PostReport> findByUserId(UUID userId);
}
