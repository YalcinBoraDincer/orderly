package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.FeedbackRequest;
import com.bora.orderly.dto.response.FeedbackResponse;
import com.bora.orderly.entity.CustomerFeedback;
import com.bora.orderly.repository.CustomerFeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceImplTest {

    @Mock
    private CustomerFeedbackRepository feedbackRepository;

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    private CustomerFeedback testFeedback;
    private FeedbackRequest validRequest;

    @BeforeEach
    void setUp() {
        testFeedback = CustomerFeedback.builder()
                .id(100L)
                .tableNumber("12")
                .rating(5)
                .comment("Service was amazing!")
                .createdAt(LocalDateTime.now())
                .build();

        validRequest = FeedbackRequest.builder()
                .tableNumber("12")
                .rating(5)
                .comment("Service was amazing!")
                .build();
    }

    @Test
    @DisplayName("Musteri geri bildirimi basariyla gonderilmeli ve veritabanina kaydedilmeli")
    void submitFeedback_ShouldSuccessAndReturnFeedbackResponse() {
        when(feedbackRepository.save(any(CustomerFeedback.class))).thenReturn(testFeedback);

        FeedbackResponse response = feedbackService.submitFeedback(validRequest);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("12", response.getTableNumber());
        assertEquals(5, response.getRating());
        assertEquals("Service was amazing!", response.getComment());
        verify(feedbackRepository, times(1)).save(any(CustomerFeedback.class));
    }

    @Test
    @DisplayName("Tum geri bildirimler tarihe gore siralanmis olarak basariyla getirilmeli")
    void getAllFeedback_ShouldReturnListOfFeedbackSortedByCreatedAt() {
        CustomerFeedback testFeedback2 = CustomerFeedback.builder()
                .id(101L)
                .tableNumber("5")
                .rating(4)
                .comment("Pizza was great!")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        when(feedbackRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(testFeedback, testFeedback2));

        List<FeedbackResponse> result = feedbackService.getAllFeedback();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(100L, result.get(0).getId());
        assertEquals(101L, result.get(1).getId());
        verify(feedbackRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }
}
