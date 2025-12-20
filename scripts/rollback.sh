#!/bin/bash
#
# Rollback Script for Desperados Destiny
# Reverts deployment to a previous version
#
# Usage: ./rollback.sh <environment> [version]
#   environment: staging or production
#   version: Git SHA or 'previous' (default: previous)
#

set -e

# Configuration
ENVIRONMENT="${1:-staging}"
TARGET_VERSION="${2:-previous}"
REGISTRY="${CONTAINER_REGISTRY:-ghcr.io}"
REPO="${GITHUB_REPOSITORY:-desperados-destiny}"
COMPOSE_DIR="/opt/desperados-destiny"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
    exit 1
}

# Validate environment
validate_environment() {
    case "$ENVIRONMENT" in
        staging)
            COMPOSE_FILE="docker-compose.staging.yml"
            ;;
        production)
            COMPOSE_FILE="docker-compose.prod.yml"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT (use 'staging' or 'production')"
            ;;
    esac

    log_info "Environment: $ENVIRONMENT"
    log_info "Compose file: $COMPOSE_FILE"
}

# Get current version
get_current_version() {
    log_info "Getting current deployed version..."

    CURRENT_VERSION=$(docker images "${REGISTRY}/${REPO}/server" --format "{{.Tag}}" 2>/dev/null | grep -v "staging\|production\|latest" | head -1)

    if [ -z "$CURRENT_VERSION" ]; then
        log_warning "Could not determine current version"
        CURRENT_VERSION="unknown"
    else
        log_info "Current version: $CURRENT_VERSION"
    fi
}

# Get previous version for rollback
get_rollback_version() {
    if [ "$TARGET_VERSION" = "previous" ]; then
        log_info "Finding previous version..."

        # Get the second most recent version (skip current)
        TARGET_VERSION=$(docker images "${REGISTRY}/${REPO}/server" --format "{{.Tag}}" 2>/dev/null | grep -v "staging\|production\|latest" | head -2 | tail -1)

        if [ -z "$TARGET_VERSION" ] || [ "$TARGET_VERSION" = "$CURRENT_VERSION" ]; then
            log_error "No previous version found to rollback to"
        fi
    fi

    log_info "Rollback target version: $TARGET_VERSION"
}

# Create backup of current state
create_backup() {
    log_info "Creating backup of current deployment state..."

    BACKUP_DIR="${COMPOSE_DIR}/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup compose file
    cp "${COMPOSE_DIR}/${COMPOSE_FILE}" "${BACKUP_DIR}/"

    # Save current container states
    docker ps --format "{{.Names}} {{.Image}}" > "${BACKUP_DIR}/containers.txt"

    # Export current version info
    echo "CURRENT_VERSION=${CURRENT_VERSION}" > "${BACKUP_DIR}/version.txt"
    echo "ROLLBACK_VERSION=${TARGET_VERSION}" >> "${BACKUP_DIR}/version.txt"
    echo "ROLLBACK_TIME=$(date -Iseconds)" >> "${BACKUP_DIR}/version.txt"

    log_success "Backup created at: $BACKUP_DIR"
}

# Perform rollback
perform_rollback() {
    log_info "Starting rollback to version: $TARGET_VERSION"

    cd "$COMPOSE_DIR"

    # Create temporary compose file with specific versions
    ROLLBACK_COMPOSE="docker-compose.rollback.yml"
    cp "$COMPOSE_FILE" "$ROLLBACK_COMPOSE"

    # Replace image tags with target version
    sed -i "s|${REGISTRY}/${REPO}/server:.*|${REGISTRY}/${REPO}/server:${TARGET_VERSION}|g" "$ROLLBACK_COMPOSE"
    sed -i "s|${REGISTRY}/${REPO}/client:.*|${REGISTRY}/${REPO}/client:${TARGET_VERSION}|g" "$ROLLBACK_COMPOSE"

    log_info "Pulling rollback images..."
    docker compose -f "$ROLLBACK_COMPOSE" pull

    log_info "Stopping current containers..."
    docker compose -f "$COMPOSE_FILE" down

    log_info "Starting rollback containers..."
    docker compose -f "$ROLLBACK_COMPOSE" up -d

    # Wait for containers to be healthy
    log_info "Waiting for containers to be healthy..."
    sleep 10

    # Verify health
    HEALTH_CHECK_ATTEMPTS=0
    MAX_HEALTH_CHECKS=12

    while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_HEALTH_CHECKS ]; do
        if curl -s --max-time 5 "http://localhost:5000/api/health" | grep -q '"status":"healthy"'; then
            log_success "Rollback containers are healthy"
            break
        fi
        ((HEALTH_CHECK_ATTEMPTS++))
        log_info "Health check attempt $HEALTH_CHECK_ATTEMPTS/$MAX_HEALTH_CHECKS..."
        sleep 5
    done

    if [ $HEALTH_CHECK_ATTEMPTS -eq $MAX_HEALTH_CHECKS ]; then
        log_error "Rollback containers failed health check"
    fi

    # Clean up rollback compose file
    rm -f "$ROLLBACK_COMPOSE"

    log_success "Rollback complete!"
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."

    # Check if smoke test script exists
    if [ -f "${COMPOSE_DIR}/scripts/smoke-test.sh" ]; then
        log_info "Running smoke tests..."
        if bash "${COMPOSE_DIR}/scripts/smoke-test.sh" "http://localhost:5000"; then
            log_success "Smoke tests passed after rollback"
        else
            log_warning "Some smoke tests failed - manual verification recommended"
        fi
    else
        log_warning "Smoke test script not found - skipping verification"
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}🔄 Desperados Destiny Rollback Script${NC}"
    echo ""

    validate_environment
    get_current_version
    get_rollback_version

    echo ""
    echo -e "${YELLOW}⚠ ROLLBACK CONFIRMATION${NC}"
    echo -e "  Environment:     ${ENVIRONMENT}"
    echo -e "  Current version: ${CURRENT_VERSION}"
    echo -e "  Target version:  ${TARGET_VERSION}"
    echo ""

    # In CI/CD, skip confirmation
    if [ -z "$CI" ]; then
        read -p "Are you sure you want to rollback? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback cancelled"
            exit 0
        fi
    fi

    create_backup
    perform_rollback
    verify_rollback

    echo ""
    echo -e "${GREEN}🎉 Rollback to $TARGET_VERSION completed successfully!${NC}"
    echo ""
}

# Run main
main
