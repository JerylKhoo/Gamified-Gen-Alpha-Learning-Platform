package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Module;
import com.genalpha.learningplatform.repository.ModuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final UserService userService;

    public ModuleService(ModuleRepository moduleRepository, UserService userService) {
        this.moduleRepository = moduleRepository;
        this.userService = userService;
    }

    public List<Module> getByCourseId(String courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    public Module getById(String moduleId) {
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found"));
    }

    public Module create(Module module, UUID requesterId) {
        requireAdmin(requesterId);
        if (module.getModuleId() == null || module.getModuleId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module ID is required");
        }
        return moduleRepository.save(module);
    }

    public Module update(String moduleId, Module updates, UUID requesterId) {
        requireAdmin(requesterId);
        Module module = getById(moduleId);
        if (updates.getContent() != null) module.setContent(updates.getContent());
        return moduleRepository.save(module);
    }

    public void delete(String moduleId, UUID requesterId) {
        requireAdmin(requesterId);
        moduleRepository.delete(getById(moduleId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
