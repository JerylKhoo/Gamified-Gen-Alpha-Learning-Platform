package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.PostUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PostUpvoteRepository extends JpaRepository<PostUpvote, UUID> {
    Optional<PostUpvote> findByPostIdAndUserId(UUID postId, UUID userId);
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
}
