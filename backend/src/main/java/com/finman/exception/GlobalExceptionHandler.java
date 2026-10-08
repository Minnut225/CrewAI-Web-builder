package com.finman.exception;

import com.finman.dto.response.ApiResponse;
import com.finman.dto.response.ValidationErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    private static final String BAD_REQUEST = "BAD_REQUEST";
    private static final String UNAUTHORIZED = "UNAUTHORIZED";
    private static final String FORBIDDEN = "FORBIDDEN";
    private static final String NOT_FOUND = "NOT_FOUND";
    private static final String METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED";
    private static final String MEDIA_TYPE_NOT_SUPPORTED = "MEDIA_TYPE_NOT_SUPPORTED";
    private static final String CONFLICT = "CONFLICT";
    private static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<ValidationErrorDetail>>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ValidationErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::mapFieldError)
                .collect(Collectors.toList());

        String message = "Dữ liệu đầu vào không hợp lệ";
        ApiResponse<List<ValidationErrorDetail>> response = ApiResponse.error(message, VALIDATION_ERROR, request.getRequestURI(), errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<List<ValidationErrorDetail>>> handleBindException(
            BindException ex, HttpServletRequest request) {

        List<ValidationErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::mapFieldError)
                .collect(Collectors.toList());

        String message = "Dữ liệu đầu vào không hợp lệ";
        ApiResponse<List<ValidationErrorDetail>> response = ApiResponse.error(message, VALIDATION_ERROR, request.getRequestURI(), errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<List<ValidationErrorDetail>>> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {

        List<ValidationErrorDetail> errors = ex.getConstraintViolations().stream()
                .map(this::mapConstraintViolation)
                .collect(Collectors.toList());

        String message = "Dữ liệu đầu vào không hợp lệ";
        ApiResponse<List<ValidationErrorDetail>> response = ApiResponse.error(message, VALIDATION_ERROR, request.getRequestURI(), errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {

        HttpStatus status = determineHttpStatus(ex.getErrorCode());
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode(), request.getRequestURI());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
            BadRequestException ex, HttpServletRequest request) {

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResourceException(
            DuplicateResourceException ex, HttpServletRequest request) {

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {

        String errorCode = UNAUTHORIZED;
        String message = "Xác thực thất bại";

        if (ex instanceof BadCredentialsException) {
            message = "Thông tin đăng nhập không chính xác";
            errorCode = "INVALID_CREDENTIALS";
        } else if (ex instanceof AuthenticationCredentialsNotFoundException) {
            message = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
            errorCode = "TOKEN_EXPIRED";
        }

        ApiResponse<Void> response = ApiResponse.error(message, errorCode, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {

        String message = "Bạn không có quyền truy cập tài nguyên này";
        ApiResponse<Void> response = ApiResponse.error(message, FORBIDDEN, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        String message = String.format("Phương thức %s không được hỗ trợ cho endpoint này", ex.getMethod());
        ApiResponse<Void> response = ApiResponse.error(message, METHOD_NOT_ALLOWED, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupportedException(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {

        String message = "Loại nội dung không được hỗ trợ: " + ex.getContentType();
        ApiResponse<Void> response = ApiResponse.error(message, MEDIA_TYPE_NOT_SUPPORTED, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        String message = String.format("Thiếu tham số bắt buộc: %s", ex.getParameterName());
        ApiResponse<Void> response = ApiResponse.error(message, BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String message = String.format("Giá trị không hợp lệ cho tham số '%s': %s", ex.getName(), ex.getValue());
        ApiResponse<Void> response = ApiResponse.error(message, BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        String message = "Dữ liệu yêu cầu không hợp lệ hoặc bị thiếu";
        ApiResponse<Void> response = ApiResponse.error(message, BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        String message = "Vi phạm ràng buộc dữ liệu";
        String errorCode = CONFLICT;

        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (rootCause != null) {
            if (rootCause.contains("duplicate key") || rootCause.contains("unique constraint")) {
                message = "Dữ liệu đã tồn tại, không thể tạo bản ghi trùng lặp";
                errorCode = "DUPLICATE_ENTRY";
            } else if (rootCause.contains("foreign key")) {
                message = "Không thể thực hiện do vi phạm khóa ngoại";
                errorCode = "FOREIGN_KEY_VIOLATION";
            }
        }

        ApiResponse<Void> response = ApiResponse.error(message, errorCode, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpServletRequest request) {

        String message = "Không tìm thấy tài nguyên: " + ex.getResourcePath();
        ApiResponse<Void> response = ApiResponse.error(message, NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {

        // Log the full stack trace for debugging
        ex.printStackTrace();

        String message = "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau";
        ApiResponse<Void> response = ApiResponse.error(message, INTERNAL_SERVER_ERROR, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private ValidationErrorDetail mapFieldError(FieldError fieldError) {
        return new ValidationErrorDetail(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private ValidationErrorDetail mapConstraintViolation(ConstraintViolation<?> violation) {
        String field = violation.getPropertyPath().toString();
        // Extract the last part of the property path (field name)
        int lastDot = field.lastIndexOf('.');
        if (lastDot >= 0) {
            field = field.substring(lastDot + 1);
        }
        return new ValidationErrorDetail(field, violation.getMessage());
    }

    private HttpStatus determineHttpStatus(String errorCode) {
        return switch (errorCode) {
            case "RESOURCE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "DUPLICATE_ENTRY", "FOREIGN_KEY_VIOLATION", "CONFLICT" -> HttpStatus.CONFLICT;
            case "UNAUTHORIZED", "INVALID_CREDENTIALS", "TOKEN_EXPIRED" -> HttpStatus.UNAUTHORIZED;
            case "FORBIDDEN" -> HttpStatus.FORBIDDEN;
            case "VALIDATION_ERROR", "BAD_REQUEST" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}