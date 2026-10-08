package com.finman.exception;

public class BadRequestException extends BusinessException {

    public BadRequestException(String message) {
        super("BAD_REQUEST", message);
    }

    public BadRequestException(String errorCode, String message) {
        super(errorCode, message);
    }

    public BadRequestException(String errorCode, String message, Object... args) {
        super(errorCode, message, args);
    }
}
