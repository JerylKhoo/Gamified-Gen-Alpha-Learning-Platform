package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, String> {
    List<Module> findByCourseIdOrderByOrderAsc(String courseId);
}
