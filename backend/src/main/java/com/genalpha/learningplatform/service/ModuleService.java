package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Module;
import java.util.List;
import java.util.UUID;

/**
 * Defines module management operations for courses in the learning platform.
 */
public interface ModuleService {
    List<Module> getByCourseId(String courseId);
    Module getById(String moduleId);
    Module create(Module module, UUID requesterId);
    Module update(String moduleId, Module updates, UUID requesterId);
    void delete(String moduleId, UUID requesterId);
    void reorder(List<String> moduleIds, UUID requesterId);
}
