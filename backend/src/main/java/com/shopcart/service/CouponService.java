package com.shopcart.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.shopcart.dto.CouponValidationRequest;
import com.shopcart.dto.CouponValidationResponse;
import com.shopcart.entity.Coupon;
import com.shopcart.repository.CouponRepository;

@Service
public class CouponService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private CouponRepository couponRepository;

    public CouponValidationResponse validateCoupon(CouponValidationRequest request) {
        BigDecimal subtotal = normalizeAmount(request != null ? request.getSubtotal() : null);
        BigDecimal shippingFee = normalizeAmount(request != null ? request.getShippingFee() : null);
        String code = request != null ? request.getCode() : null;

        if (!StringUtils.hasText(code)) {
            return failure("Vui lòng nhập mã giảm giá hợp lệ", subtotal, shippingFee);
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
            .orElse(null);

        if (coupon == null) {
            return failure("Mã giảm giá không tồn tại", subtotal, shippingFee);
        }

        String validationError = validateCouponState(coupon, subtotal);
        if (validationError != null) {
            return failure(validationError, subtotal, shippingFee);
        }

        BigDecimal discount = calculateDiscount(coupon, subtotal);
        BigDecimal total = subtotal.add(shippingFee).subtract(discount);

        return CouponValidationResponse.builder()
            .success(true)
            .message("Áp mã giảm giá thành công")
            .coupon(toCouponInfo(coupon))
            .subtotal(subtotal)
            .shippingFee(shippingFee)
            .discountAmount(discount)
            .total(total.max(BigDecimal.ZERO))
            .build();
    }

    public Coupon requireValidCoupon(String code, BigDecimal subtotal) {
        if (!StringUtils.hasText(code)) {
            return null;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
            .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        String validationError = validateCouponState(coupon, normalizeAmount(subtotal));
        if (validationError != null) {
            throw new RuntimeException(validationError);
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal normalizedSubtotal = normalizeAmount(subtotal);
        String discountType = coupon.getDiscountType() == null ? "" : coupon.getDiscountType().trim().toUpperCase();
        BigDecimal discount = BigDecimal.ZERO;

        if ("PERCENTAGE".equals(discountType)) {
            discount = normalizedSubtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if ("FIXED_AMOUNT".equals(discountType)) {
            discount = coupon.getDiscountValue();
        }

        return discount.max(BigDecimal.ZERO).min(normalizedSubtotal);
    }

    public void incrementUsage(Coupon coupon) {
        if (coupon == null) {
            return;
        }

        coupon.setUsedCount((coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1);
        couponRepository.save(coupon);
    }

    private CouponValidationResponse failure(String message, BigDecimal subtotal, BigDecimal shippingFee) {
        return CouponValidationResponse.builder()
            .success(false)
            .message(message)
            .subtotal(subtotal)
            .shippingFee(shippingFee)
            .discountAmount(BigDecimal.ZERO)
            .total(subtotal.add(shippingFee))
            .build();
    }

    private CouponValidationResponse.CouponInfo toCouponInfo(Coupon coupon) {
        return CouponValidationResponse.CouponInfo.builder()
            .code(coupon.getCode())
            .discountType(coupon.getDiscountType())
            .discountValue(coupon.getDiscountValue())
            .minOrderValue(coupon.getMinOrderValue())
            .usageLimit(coupon.getUsageLimit())
            .usedCount(coupon.getUsedCount())
            .expiryDate(coupon.getExpiryDate())
            .isActive(coupon.getIsActive())
            .build();
    }

    private String validateCouponState(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getIsActive() == null || !coupon.getIsActive()) {
            return "Mã giảm giá đã bị khóa";
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return "Mã giảm giá đã hết lượt sử dụng";
        }

        LocalDateTime expiryDate = parseDateTime(coupon.getExpiryDate());
        if (expiryDate != null && !LocalDateTime.now().isBefore(expiryDate)) {
            return "Mã giảm giá đã hết hạn";
        }

        BigDecimal minOrderValue = normalizeAmount(coupon.getMinOrderValue());
        if (subtotal.compareTo(minOrderValue) < 0) {
            return "Đơn hàng chưa đạt giá trị tối thiểu để áp mã giảm giá";
        }

        return null;
    }

    private LocalDateTime parseDateTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return LocalDateTime.parse(value.trim(), DATE_TIME_FORMATTER);
        } catch (Exception _error) {
            return null;
        }
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.max(BigDecimal.ZERO);
    }
}