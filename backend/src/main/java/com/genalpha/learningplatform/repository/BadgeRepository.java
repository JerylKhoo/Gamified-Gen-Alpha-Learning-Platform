package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, String> {
}
