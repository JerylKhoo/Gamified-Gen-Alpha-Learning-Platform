package com.genalpha.learningplatform.service;

import java.util.List;

/**
 * Defines storage operations for accessing files in Supabase Storage.
 */
public interface StorageService {
    List<String> listProfilePicUrls();
}
