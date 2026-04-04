package com.genalpha.learningplatform.model;

public enum Role {
    User,
    Collaborator,
    Admin;

    public static boolean isValid(String role) {
        for (Role r : values()) {
            if (r.name().equals(role)) return true;
        }
        return false;
    }
}
