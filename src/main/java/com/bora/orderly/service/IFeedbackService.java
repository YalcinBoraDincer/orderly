package com.bora.orderly.service;

import com.bora.orderly.dto.request.FeedbackRequest;
import com.bora.orderly.dto.response.FeedbackResponse;
import java.util.List;

public interface IFeedbackService {
    FeedbackResponse submitFeedback(FeedbackRequest request);
    List<FeedbackResponse> getAllFeedback();
}
