package com.genalpha.learningplatform.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "\"USER\"")
public class User {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column
    private Integer points;

    @Column(name = "profile_pic")
    private String profilePic;

    @Column(nullable = false)
    private String role = "User";

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
