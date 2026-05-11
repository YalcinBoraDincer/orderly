package com.bora.orderly.controller.impl;

import com.bora.orderly.dto.request.FeedbackRequest;
import com.bora.orderly.dto.response.FeedbackResponse;
import com.bora.orderly.service.IFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final IFeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse response = feedbackService.submitFeedback(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
