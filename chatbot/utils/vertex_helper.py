import os
import random

def get_vertex_config() -> tuple[str, str]:
    """
    Trích xuất cấu hình Vertex AI từ biến môi trường.
    Hỗ trợ chạy nhiều project cùng lúc bằng cách cung cấp danh sách phân tách bằng dấu phẩy.
    Ví dụ:
      PROJECT_ID=cccccc-490110,sacred-flash-501307-j0
      LOCATION=asia-southeast1,us-central1
    """
    project_str = os.environ.get("PROJECT_ID", "")
    location_str = os.environ.get("LOCATION", "us-central1")

    # Tách danh sách project
    projects = [p.strip() for p in project_str.split(",") if p.strip()]
    # Tách danh sách location
    locations = [l.strip() for l in location_str.split(",") if l.strip()]

    if not projects:
        return "", "us-central1"

    # Chọn ngẫu nhiên một cặp project-location để phân tải (load balancing)
    idx = random.randint(0, len(projects) - 1)
    project = projects[idx]

    # Map location tương ứng, nếu thiếu thì dùng location đầu tiên hoặc us-central1
    if idx < len(locations):
        location = locations[idx]
    elif locations:
        location = locations[0]
    else:
        location = "us-central1"

    return project, location
