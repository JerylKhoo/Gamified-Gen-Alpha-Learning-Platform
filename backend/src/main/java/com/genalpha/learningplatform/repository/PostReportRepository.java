package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostReportRepository extends JpaRepository<PostReport, UUID> {
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    List<PostReport> findByUserId(UUID userId);
    long countByPostId(UUID postId);

    @Query("SELECT COUNT(r) FROM PostReport r JOIN Post p ON r.postId = p.postId WHERE p.userId = :authorId")
    long countReportsOnPostsByAuthor(@Param("authorId") UUID authorId);
}
