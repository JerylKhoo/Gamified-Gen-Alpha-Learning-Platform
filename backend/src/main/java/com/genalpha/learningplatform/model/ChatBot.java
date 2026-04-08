package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;
import java.time.OffsetDateTime;

/**
 * Represents a chatbot session associated with a user.
 */
@Getter
@Setter
@Entity
@Table(name = "chat_bot")
public class ChatBot {

    @Id
    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer score = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "chat_history", columnDefinition = "jsonb")
    private String chatHistory;

    @Column(name = "feedback")
    private String feedback;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
