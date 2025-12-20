#!/bin/bash
#
# Smoke Test Script for Desperados Destiny
# Verifies deployment health after staging/production releases
#
# Usage: ./smoke-test.sh <base_url> [--strict]
#   base_url: The base URL to test (e.g., https://staging.desperados.game)
#   --strict: Exit on first failure (default: collect all failures)
#

set -o pipefail

# Configuration
BASE_URL="${1:-http://localhost:3000}"
STRICT_MODE="${2:-}"
API_URL="${BASE_URL}/api"
TIMEOUT=30
MAX_RETRIES=12
RETRY_DELAY=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}❌${NC} $1"
    ((FAILED++))
    if [ "$STRICT_MODE" = "--strict" ]; then
        echo -e "${RED}Strict mode enabled - exiting on first failure${NC}"
        exit 1
    fi
}

log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# Check if a URL returns expected status code
check_status() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    local allow_redirect=${4:-false}

    local curl_opts="--max-time $TIMEOUT -s -o /dev/null -w %{http_code}"
    if [ "$allow_redirect" = "true" ]; then
        curl_opts="$curl_opts -L"
    fi

    local response
    response=$(curl $curl_opts "$url" 2>/dev/null || echo "000")

    if [ "$response" = "$expected_status" ]; then
        log_success "$description (HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        log_error "$description - Connection failed (timeout/unreachable)"
        return 1
    else
        log_error "$description - Expected HTTP $expected_status, got HTTP $response"
        return 1
    fi
}

# Check JSON field value
check_json_field() {
    local url=$1
    local field=$2
    local expected=$3
    local description=$4

    local response
    response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null)

    if [ -z "$response" ]; then
        log_error "$description - No response received"
        return 1
    fi

    local value
    value=$(echo "$response" | jq -r ".$field" 2>/dev/null)

    if [ "$value" = "$expected" ]; then
        log_success "$description ($field=$value)"
        return 0
    elif [ "$value" = "null" ]; then
        log_error "$description - Field '$field' not found in response"
        return 1
    else
        log_error "$description - Expected $field='$expected', got '$value'"
        return 1
    fi
}

# Check response contains string
check_contains() {
    local url=$1
    local needle=$2
    local description=$3

    local response
    response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null)

    if echo "$response" | grep -q "$needle"; then
        log_success "$description"
        return 0
    else
        log_error "$description - Response does not contain '$needle'"
        return 1
    fi
}

# Wait for server to be ready
wait_for_server() {
    log_header "Waiting for server to be ready"

    for i in $(seq 1 $MAX_RETRIES); do
        if curl -s --max-time 5 "${API_URL}/health" > /dev/null 2>&1; then
            log_success "Server is ready after $i attempt(s)"
            return 0
        fi
        log_info "Attempt $i/$MAX_RETRIES - Server not ready, waiting ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done

    log_error "Server failed to become ready after $MAX_RETRIES attempts"
    exit 1
}

# Health check tests
test_health() {
    log_header "Health Endpoint Tests"

    check_status "${API_URL}/health" 200 "Health endpoint accessible"
    check_json_field "${API_URL}/health" "status" "healthy" "Overall health status"
    check_json_field "${API_URL}/health" "database.status" "connected" "MongoDB connection"
    check_json_field "${API_URL}/health" "redis.status" "connected" "Redis connection"
}

# Public API endpoint tests
test_public_api() {
    log_header "Public API Endpoint Tests"

    check_status "${API_URL}/locations" 200 "Locations endpoint (public)"
    check_status "${API_URL}/leaderboard/wealth" 200 "Wealth leaderboard (public)"
    check_status "${API_URL}/auth/status" 200 "Auth status endpoint"
}

# Authentication enforcement tests
test_auth_enforcement() {
    log_header "Authentication Enforcement Tests"

    check_status "${API_URL}/characters" 401 "Characters requires authentication"
    check_status "${API_URL}/gold/balance" 401 "Gold balance requires authentication"
    check_status "${API_URL}/quests" 401 "Quests requires authentication"
    check_status "${API_URL}/inventory" 401 "Inventory requires authentication"
}

# Frontend tests
test_frontend() {
    log_header "Frontend Tests"

    check_status "${BASE_URL}" 200 "Frontend root loads" true
    check_status "${BASE_URL}/login" 200 "Login page loads" true
    check_status "${BASE_URL}/register" 200 "Register page loads" true
}

# WebSocket connectivity test
test_websocket() {
    log_header "WebSocket Connectivity Test"

    # Check if socket.io endpoint responds
    local ws_response
    ws_response=$(curl -s --max-time $TIMEOUT "${BASE_URL}/socket.io/?EIO=4&transport=polling" 2>/dev/null)

    if echo "$ws_response" | grep -q "sid"; then
        log_success "WebSocket endpoint accessible (socket.io)"
    else
        log_warning "WebSocket endpoint may not be accessible - check manually"
    fi
}

# Database operation test (via health endpoint metrics)
test_database_operations() {
    log_header "Database Operation Tests"

    # Get health with detailed info
    local health_response
    health_response=$(curl -s --max-time $TIMEOUT "${API_URL}/health" 2>/dev/null)

    local db_latency
    db_latency=$(echo "$health_response" | jq -r ".database.latency // \"unknown\"" 2>/dev/null)

    if [ "$db_latency" != "unknown" ] && [ "$db_latency" != "null" ]; then
        log_success "Database latency: ${db_latency}ms"
    else
        log_warning "Could not determine database latency"
    fi

    local redis_latency
    redis_latency=$(echo "$health_response" | jq -r ".redis.latency // \"unknown\"" 2>/dev/null)

    if [ "$redis_latency" != "unknown" ] && [ "$redis_latency" != "null" ]; then
        log_success "Redis latency: ${redis_latency}ms"
    else
        log_warning "Could not determine Redis latency"
    fi
}

# Performance baseline test
test_performance() {
    log_header "Performance Baseline Tests"

    # Test response time of critical endpoints
    local start_time end_time duration

    start_time=$(date +%s%3N)
    curl -s --max-time $TIMEOUT "${API_URL}/health" > /dev/null 2>&1
    end_time=$(date +%s%3N)
    duration=$((end_time - start_time))

    if [ $duration -lt 500 ]; then
        log_success "Health endpoint response time: ${duration}ms (< 500ms)"
    elif [ $duration -lt 1000 ]; then
        log_warning "Health endpoint response time: ${duration}ms (< 1000ms but slow)"
    else
        log_error "Health endpoint response time: ${duration}ms (> 1000ms - too slow)"
    fi

    start_time=$(date +%s%3N)
    curl -s --max-time $TIMEOUT "${BASE_URL}" > /dev/null 2>&1
    end_time=$(date +%s%3N)
    duration=$((end_time - start_time))

    if [ $duration -lt 2000 ]; then
        log_success "Frontend load time: ${duration}ms (< 2000ms)"
    elif [ $duration -lt 5000 ]; then
        log_warning "Frontend load time: ${duration}ms (< 5000ms but slow)"
    else
        log_error "Frontend load time: ${duration}ms (> 5000ms - too slow)"
    fi
}

# Print summary
print_summary() {
    log_header "Smoke Test Summary"

    echo ""
    echo -e "  ${GREEN}Passed:${NC}   $PASSED"
    echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
    echo -e "  ${RED}Failed:${NC}   $FAILED"
    echo ""

    local total=$((PASSED + FAILED))
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All $total smoke tests passed!${NC}"
        return 0
    else
        echo -e "${RED}💥 $FAILED of $total smoke tests failed!${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}🔥 Desperados Destiny Smoke Tests${NC}"
    echo -e "${BLUE}   Testing: ${BASE_URL}${NC}"
    echo ""

    # Check for required tools
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed - some tests may be limited"
    fi

    wait_for_server
    test_health
    test_public_api
    test_auth_enforcement
    test_frontend
    test_websocket
    test_database_operations
    test_performance
    print_summary
}

# Run main
main
exit $?
