package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
}
