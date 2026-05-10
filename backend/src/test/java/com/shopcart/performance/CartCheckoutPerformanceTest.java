package com.shopcart.performance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.shopcart.controller.CartController;
import com.shopcart.controller.OrderController;
import com.shopcart.dto.CartResponse;
import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderCreateRequest.Customer;
import com.shopcart.dto.OrderCreateRequest.OrderItemRequest;
import com.shopcart.service.CartService;
import com.shopcart.service.OrderService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest({CartController.class, OrderController.class})
@DisplayName("Advanced Performance Tests for Cart and Checkout APIs")
class CartCheckoutPerformanceTest {

    private static final int CART_CONCURRENCY = 20;
    private static final int CART_REQUESTS_PER_USER = 5;
    private static final int CHECKOUT_CONCURRENCY = 10;
    private static final int CHECKOUT_REQUESTS_PER_USER = 4;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private OrderService orderService;

    @Test
    @DisplayName("Cart add API load test - 20 concurrent users, 100 requests")
    void cartAddLoadTest() throws Exception {
        when(cartService.addToCart(any(), any(), anyInt())).thenAnswer(invocation -> {
            TimeUnit.MILLISECONDS.sleep(5);
            return CartResponse.builder()
                .success(true)
                .message("Thêm vào giỏ hàng thành công")
                .cartTotal(50000L)
                .build();
        });

        BenchmarkResult result = runBenchmark(
            "cart-add",
            CART_CONCURRENCY,
            CART_REQUESTS_PER_USER,
            () -> mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCartAddPayload())))
                .andExpect(status().isOk())
        );

        printResult(result);

        assertEquals(0, result.errorCount(), "Cart add benchmark should not produce errors");
        assertTrue(result.averageMs() < 100, "Average cart latency should stay under 100ms in the mock benchmark");
        assertTrue(result.p95Ms() < 400, "Cart p95 latency should stay under 400ms in the mock benchmark");
    }

    @Test
    @DisplayName("Checkout API load test - 10 concurrent users, 40 requests")
    void checkoutLoadTest() throws Exception {
        when(orderService.processOrder(any(), any())).thenAnswer(invocation -> {
            TimeUnit.MILLISECONDS.sleep(8);
            return "ORD-PERF-001";
        });

        BenchmarkResult result = runBenchmark(
            "checkout",
            CHECKOUT_CONCURRENCY,
            CHECKOUT_REQUESTS_PER_USER,
            () -> mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCheckoutPayload())))
                .andExpect(status().isCreated())
        );

        printResult(result);

        assertEquals(0, result.errorCount(), "Checkout benchmark should not produce errors");
        assertTrue(result.averageMs() < 120, "Average checkout latency should stay under 120ms in the mock benchmark");
        assertTrue(result.p95Ms() < 180, "Checkout p95 latency should stay under 180ms in the mock benchmark");
    }

    private BenchmarkResult runBenchmark(String label, int concurrentUsers, int requestsPerUser, ThrowingRunnable request) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(concurrentUsers);
        CompletionService<List<Long>> completionService = new ExecutorCompletionService<>(executor);
        CountDownLatch ready = new CountDownLatch(concurrentUsers);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger errors = new AtomicInteger();

        for (int i = 0; i < concurrentUsers; i++) {
            completionService.submit(createWorker(ready, start, requestsPerUser, request, errors));
        }

        ready.await(10, TimeUnit.SECONDS);
        long startedAt = System.nanoTime();
        start.countDown();

        List<Long> latencies = new ArrayList<>();
        for (int i = 0; i < concurrentUsers; i++) {
            Future<List<Long>> future = completionService.take();
            latencies.addAll(future.get());
        }

        executor.shutdownNow();

        long elapsedNs = System.nanoTime() - startedAt;
        long totalRequests = (long) concurrentUsers * requestsPerUser;
        return new BenchmarkResult(label, totalRequests, elapsedNs, latencies, errors.get());
    }

    private Callable<List<Long>> createWorker(
            CountDownLatch ready,
            CountDownLatch start,
            int requestsPerUser,
            ThrowingRunnable request,
            AtomicInteger errors) {
        return () -> {
            ready.countDown();
            start.await();

            List<Long> latencies = new ArrayList<>();
            for (int i = 0; i < requestsPerUser; i++) {
                long requestStartedAt = System.nanoTime();
                try {
                    request.run();
                    latencies.add(Duration.ofNanos(System.nanoTime() - requestStartedAt).toMillis());
                } catch (Exception ex) {
                    errors.incrementAndGet();
                }
            }

            return latencies;
        };
    }

    private void printResult(BenchmarkResult result) {
        System.out.println(result.toSummaryLine());
    }

    private OrderCreateRequest newCheckoutPayload() {
        return OrderCreateRequest.builder()
            .customer(Customer.builder()
                .fullName("Nguyễn Văn A")
                .phone("0901234567")
                .address("12 Nguyễn Huệ")
                .city("hcm")
                .district("q1")
                .cityLabel("Hồ Chí Minh")
                .districtLabel("Quận 1")
                .build())
            .items(List.of(OrderItemRequest.builder().productId(1L).quantity(2).build()))
            .total(BigDecimal.valueOf(30050000L))
            .build();
    }

    private com.shopcart.dto.CartItemRequest newCartAddPayload() {
        return com.shopcart.dto.CartItemRequest.builder()
            .productId("P001")
            .quantity(1)
            .build();
    }

    @FunctionalInterface
    private interface ThrowingRunnable {
        void run() throws Exception;
    }

    private static final class BenchmarkResult {
        private final String label;
        private final long totalRequests;
        private final long elapsedNs;
        private final List<Long> samples;
        private final int errorCount;

        private BenchmarkResult(String label, long totalRequests, long elapsedNs, List<Long> samples, int errorCount) {
            this.label = label;
            this.totalRequests = totalRequests;
            this.elapsedNs = elapsedNs;
            this.samples = Collections.unmodifiableList(new ArrayList<>(samples));
            this.errorCount = errorCount;
        }

        private int errorCount() {
            return errorCount;
        }

        private double averageMs() {
            if (samples.isEmpty()) {
                return 0d;
            }
            return samples.stream().mapToLong(Long::longValue).average().orElse(0d);
        }

        private long p95Ms() {
            if (samples.isEmpty()) {
                return 0L;
            }
            List<Long> sorted = samples.stream().sorted().collect(Collectors.toList());
            int index = Math.min(sorted.size() - 1, (int) Math.ceil(sorted.size() * 0.95) - 1);
            return sorted.get(index);
        }

        private double throughputRps() {
            double seconds = elapsedNs / 1_000_000_000d;
            return seconds == 0d ? totalRequests : totalRequests / seconds;
        }

        private double errorRate() {
            return totalRequests == 0 ? 0d : (double) errorCount / totalRequests;
        }

        private String toSummaryLine() {
            return String.format(
                "[PERF][%s] requests=%d errors=%d errorRate=%.2f%% avg=%.2fms p95=%dms throughput=%.2frps",
                label,
                totalRequests,
                errorCount,
                errorRate() * 100d,
                averageMs(),
                p95Ms(),
                throughputRps()
            );
        }
    }
}