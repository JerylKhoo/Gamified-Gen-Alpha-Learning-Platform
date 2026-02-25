package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Modifying
    @Query("UPDATE User u SET " +
           "u.name       = CASE WHEN :name       IS NOT NULL THEN :name       ELSE u.name       END, " +
           "u.profilePic = CASE WHEN :profilePic IS NOT NULL THEN :profilePic ELSE u.profilePic END " +
           "WHERE u.userId = :userId")
    void updateProfile(@Param("userId")     UUID   userId,
                       @Param("name")       String name,
                       @Param("profilePic") String profilePic);
}
