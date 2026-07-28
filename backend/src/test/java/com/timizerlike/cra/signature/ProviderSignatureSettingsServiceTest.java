package com.timizerlike.cra.signature;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.signature.ProviderSignatureSettings;
import com.timizer.backend.cra.signature.ProviderSignatureSettingsRepository;

class ProviderSignatureSettingsServiceTest {

    private static final String NAME = "Alice Dupont";
    private static final String IMAGE = "data:image/png;base64,abc123";

    private ProviderSignatureSettingsRepository repository;
    private ProviderSignatureSettingsService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProviderSignatureSettingsRepository.class);
        service = new ProviderSignatureSettingsService(repository);
    }

    @Test
    void getReturnsEmptyWhenNoSettingsSaved() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThat(service.get()).isEmpty();
    }

    @Test
    void getReturnsStoredSettings() {
        ProviderSignatureSettings stored = new ProviderSignatureSettings(NAME, IMAGE);
        when(repository.findById(1L)).thenReturn(Optional.of(stored));

        assertThat(service.get()).contains(stored);
    }

    @Test
    void saveCreatesNewRecordWhenNoneExists() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        ProviderSignatureSettings saved = new ProviderSignatureSettings(NAME, IMAGE);
        when(repository.save(any())).thenReturn(saved);

        ProviderSignatureSettings result = service.save(NAME, IMAGE);

        verify(repository).save(any(ProviderSignatureSettings.class));
        assertThat(result.getSignerName()).isEqualTo(NAME);
        assertThat(result.getSignatureImage()).isEqualTo(IMAGE);
    }

    @Test
    void saveUpdatesExistingRecord() {
        ProviderSignatureSettings existing = new ProviderSignatureSettings("Old Name", "old-image");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        ProviderSignatureSettings result = service.save(NAME, IMAGE);

        assertThat(result.getSignerName()).isEqualTo(NAME);
        assertThat(result.getSignatureImage()).isEqualTo(IMAGE);
        verify(repository).save(existing);
    }

    @Test
    void deleteRemovesById() {
        service.delete();

        verify(repository).deleteById(1L);
        verify(repository, never()).deleteAll();
    }
}
