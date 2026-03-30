package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Module;
import com.genalpha.learningplatform.service.ModuleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for ModuleController using MockMvc.
 */
@WebMvcTest(ModuleController.class)
@DisplayName("ModuleController Unit Tests")
class ModuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ModuleService moduleService;

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with module list when modules exist for course")
    void getByCourseId_returns200WithModuleList() throws Exception {
        // Arrange
        Module module = new Module();
        module.setModuleId("cs101-m1");
        module.setCourseId("cs101");
        module.setOrder(1);

        when(moduleService.getByCourseId("cs101")).thenReturn(List.of(module));

        // Act & Assert
        mockMvc.perform(get("/api/v1/modules/course/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].moduleId").value("cs101-m1"));

        verify(moduleService, times(1)).getByCourseId("cs101");
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with module when module exists")
    void getById_returns200_whenModuleExists() throws Exception {
        // Arrange
        Module module = new Module();
        module.setModuleId("cs101-m1");
        module.setCourseId("cs101");

        when(moduleService.getById("cs101-m1")).thenReturn(module);

        // Act & Assert
        mockMvc.perform(get("/api/v1/modules/cs101-m1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("cs101"));

        verify(moduleService, times(1)).getById("cs101-m1");
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 404 when module does not exist")
    void getById_returns404_whenModuleNotFound() throws Exception {
        // Arrange
        when(moduleService.getById("missing"))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Module not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/modules/missing"))
                .andExpect(status().isNotFound());

        verify(moduleService, times(1)).getById("missing");
    }
}
