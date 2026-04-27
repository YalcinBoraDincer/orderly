package com.bora.orderly.service;

public interface IQrCodeService {
    byte[] generateQrCode(String content, int width, int height) throws Exception;
}
