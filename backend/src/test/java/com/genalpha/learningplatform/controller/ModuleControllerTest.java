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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for ModuleController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(ModuleController.class)
@DisplayName("ModuleController Black-Box Tests")
class ModuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ModuleService moduleService;

    // ── GET /api/v1/modules/course/{courseId} ─────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /modules/course/{courseId} → 200 with ApiResponse envelope containing module list")
    void getByCourseId_returns200WithEnvelopedModuleList() throws Exception {
        Module module = new Module();
        module.setModuleId("cs101-m1");
        module.setCourseId("cs101");
        module.setOrder(1);

        when(moduleService.getByCourseId("cs101")).thenReturn(List.of(module));

        mockMvc.perform(get("/api/v1/modules/course/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].moduleId").value("cs101-m1"));

        verify(moduleService, times(1)).getByCourseId("cs101");
    }

    // ── GET /api/v1/modules/{moduleId} ────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /modules/{moduleId} → 200 with ApiResponse envelope when module exists")
    void getById_returns200WithEnvelopedModule() throws Exception {
        Module module = new Module();
        module.setModuleId("cs101-m1");
        module.setCourseId("cs101");

        when(moduleService.getById("cs101-m1")).thenReturn(module);

        mockMvc.perform(get("/api/v1/modules/cs101-m1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value("cs101"));

        verify(moduleService, times(1)).getById("cs101-m1");
    }

    @Test
    @WithMockUser
    @DisplayName("GET /modules/{moduleId} → 404 when module does not exist")
    void getById_returns404_whenModuleNotFound() throws Exception {
        when(moduleService.getById("missing"))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Module not found"));

        mockMvc.perform(get("/api/v1/modules/missing"))
                .andExpect(status().isNotFound());

        verify(moduleService, times(1)).getById("missing");
    }

    // ── POST /api/v1/modules ──────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /modules → 201 with created module")
    void create_returns201WithCreatedModule() throws Exception {
        Module module = new Module();
        module.setModuleId("cs101-m2");
        module.setCourseId("cs101");

        when(moduleService.create(any(Module.class), any())).thenReturn(module);

        mockMvc.perform(post("/api/v1/modules").with(csrf())
                        .contentType("application/json")
                        .content("{\"moduleId\":\"cs101-m2\",\"courseId\":\"cs101\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.moduleId").value("cs101-m2"));

        verify(moduleService, times(1)).create(any(Module.class), any());
    }

    // ── DELETE /api/v1/modules/{moduleId} ─────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /modules/{moduleId} → 204 when module deleted successfully")
    void delete_returns204_whenDeleted() throws Exception {
        doNothing().when(moduleService).delete(eq("cs101-m1"), any());

        mockMvc.perform(delete("/api/v1/modules/cs101-m1").with(csrf()))
                .andExpect(status().isNoContent());

        verify(moduleService, times(1)).delete(eq("cs101-m1"), any());
    }
}
