package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.FeedbackRequest;
import com.bora.orderly.dto.response.FeedbackResponse;
import com.bora.orderly.entity.CustomerFeedback;
import com.bora.orderly.repository.CustomerFeedbackRepository;
import com.bora.orderly.service.IFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements IFeedbackService {

    private final CustomerFeedbackRepository feedbackRepository;

    @Override
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        CustomerFeedback feedback = CustomerFeedback.builder()
                .tableNumber(request.getTableNumber())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    @Override
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FeedbackResponse toResponse(CustomerFeedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .tableNumber(feedback.getTableNumber())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
