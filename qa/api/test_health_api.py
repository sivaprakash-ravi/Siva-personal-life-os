import os
import pytest
from playwright.sync_api import Playwright


@pytest.mark.smoke
@pytest.mark.api
def test_health_endpoint(playwright: Playwright):
    base_url = os.getenv("SIVA_API_BASE_URL", "http://localhost:8000")

    request = playwright.request.new_context(base_url=base_url)

    try:
        response = request.get("/health")

        assert response.status == 200
        assert response.ok
        assert response.json() == {"status": "ok"}

    finally:
        request.dispose()
