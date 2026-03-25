package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.model.UserBadge;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BadgeSummary {
    private Badge badge;
    private boolean earned;
    private UserBadge userBadge; // null if not earned
}
