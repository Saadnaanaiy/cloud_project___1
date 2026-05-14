import json
import os
from locust import HttpUser, task, between, tag


class EmployeePlatformUser(HttpUser):
    wait_time = between(1, 3)
    token = None
    base_url = os.getenv("API_URL", "https://empmanager.duckdns.org")

    def on_start(self):
        password = os.getenv("TEST_PASSWORD", "admin123")
        res = self.client.post(
            "/api/auth/login",
            json={"email": "admin@company.com", "password": password},
        )
        if res.status_code in (200, 201):
            self.token = res.json().get("access_token")

    @tag("auth")
    @task(1)
    def login(self):
        password = os.getenv("TEST_PASSWORD", "admin123")
        res = self.client.post(
            "/api/auth/login",
            json={"email": "admin@company.com", "password": password},
        )
        if res.status_code in (200, 201):
            self.token = res.json().get("access_token")

    @tag("employees")
    @task(3)
    def list_employees(self):
        if not self.token:
            return
        self.client.get(
            "/api/employees",
            headers={"Authorization": f"Bearer {self.token}"},
        )

    @tag("health")
    @task(2)
    def health_check(self):
        self.client.get("/api/health")

    @tag("announcements")
    @task(2)
    def list_announcements(self):
        if not self.token:
            return
        self.client.get(
            "/api/announcements",
            headers={"Authorization": f"Bearer {self.token}"},
        )

    @tag("departments")
    @task(1)
    def list_departments(self):
        if not self.token:
            return
        self.client.get(
            "/api/departments",
            headers={"Authorization": f"Bearer {self.token}"},
        )
