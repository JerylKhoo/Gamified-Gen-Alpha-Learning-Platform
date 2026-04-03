package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET " +
           "u.name       = CASE WHEN :name       IS NOT NULL THEN :name       ELSE u.name       END, " +
           "u.profilePic = CASE WHEN :profilePic IS NOT NULL THEN :profilePic ELSE u.profilePic END " +
           "WHERE u.userId = :userId")
    void updateProfile(@Param("userId")     UUID   userId,
                       @Param("name")       String name,
                       @Param("profilePic") String profilePic);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.role = :role WHERE u.userId = :userId")
    void updateRole(@Param("userId") UUID userId, @Param("role") String role);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.reportCount = u.reportCount + 1 WHERE u.userId = :userId")
    void incrementReportCount(@Param("userId") UUID userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.reportCount = CASE WHEN u.reportCount >= :count THEN u.reportCount - :count ELSE 0 END WHERE u.userId = :userId")
    void decrementReportCount(@Param("userId") UUID userId, @Param("count") int count);
}
