package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "badge_id")
    private UUID badgeId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(length = 255)
    private String icon;

    public UUID getBadgeId() { return badgeId; }
    public void setBadgeId(UUID badgeId) { this.badgeId = badgeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
