package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Module;
import com.genalpha.learningplatform.repository.ModuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ModuleServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ModuleServiceImpl Unit Tests")
class ModuleServiceImplTest {

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ModuleServiceImpl moduleService;

    private UUID adminId;
    private Module module;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        module = new Module();
        module.setModuleId("cs101-m1");
        module.setCourseId("cs101");
        module.setContent("Intro content");
        module.setOrder(1);
    }

    @Test
    @DisplayName("Should return modules for course when modules exist")
    void getByCourseId_returnsModuleList() {
        // Arrange
        List<Module> expectedModules = List.of(module);
        when(moduleRepository.findByCourseIdOrderByOrderAsc("cs101")).thenReturn(expectedModules);

        // Act
        List<Module> result = moduleService.getByCourseId("cs101");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("cs101-m1", result.get(0).getModuleId());
        verify(moduleRepository, times(1)).findByCourseIdOrderByOrderAsc("cs101");
    }

    @Test
    @DisplayName("Should return module when module exists")
    void getById_returnsModule_whenFound() {
        // Arrange
        when(moduleRepository.findById("cs101-m1")).thenReturn(Optional.of(module));

        // Act
        Module result = moduleService.getById("cs101-m1");

        // Assert
        assertNotNull(result);
        assertEquals("cs101", result.getCourseId());
        verify(moduleRepository, times(1)).findById("cs101-m1");
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when module does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        when(moduleRepository.findById("missing")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> moduleService.getById("missing"));
        assertNotNull(exception);
        verify(moduleRepository, times(1)).findById("missing");
    }

    @Test
    @DisplayName("Should save module when requester is admin and module ID is present")
    void create_savesModule_whenAdminAndIdPresent() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(moduleRepository.save(module)).thenReturn(module);

        // Act
        Module result = moduleService.create(module, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("cs101-m1", result.getModuleId());
        verify(userService, times(1)).isAdmin(adminId);
        verify(moduleRepository, times(1)).save(module);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when module ID is blank")
    void create_throwsBadRequest_whenModuleIdBlank() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        module.setModuleId("");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> moduleService.create(module, adminId));
        assertNotNull(exception);
        verify(moduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void create_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> moduleService.create(module, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(moduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update module content when requester is admin")
    void update_updatesContent_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(moduleRepository.findById("cs101-m1")).thenReturn(Optional.of(module));
        Module updates = new Module();
        updates.setContent("Updated content");
        when(moduleRepository.save(module)).thenReturn(module);

        // Act
        Module result = moduleService.update("cs101-m1", updates, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("Updated content", result.getContent());
        verify(userService, times(1)).isAdmin(adminId);
        verify(moduleRepository, times(1)).findById("cs101-m1");
        verify(moduleRepository, times(1)).save(module);
    }

    @Test
    @DisplayName("Should delete module when requester is admin")
    void delete_deletesModule_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(moduleRepository.findById("cs101-m1")).thenReturn(Optional.of(module));

        // Act
        moduleService.delete("cs101-m1", adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(moduleRepository, times(1)).findById("cs101-m1");
        verify(moduleRepository, times(1)).delete(module);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin and tries to delete")
    void delete_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> moduleService.delete("cs101-m1", adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(moduleRepository, never()).delete(any());
    }
}
