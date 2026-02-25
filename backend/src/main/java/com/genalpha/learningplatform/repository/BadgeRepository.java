package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BadgeRepository extends JpaRepository<Badge, UUID> {
}
