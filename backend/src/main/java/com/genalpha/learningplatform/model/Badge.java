package com.genalpha.learningplatform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @Column(name = "badge_id")
    private String badgeId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(columnDefinition = "TEXT")
    private String icon;

    public String getBadgeId() { return badgeId; }
    public void setBadgeId(String badgeId) { this.badgeId = badgeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
