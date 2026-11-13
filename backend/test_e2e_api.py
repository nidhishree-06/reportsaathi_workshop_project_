import io
import sys
from pathlib import Path
from PIL import Image, ImageDraw
import httpx

API_BASE = "http://localhost:8000"

def run_tests():
    print("=== E2E API Verification for ReportSaathi ===")
    
    # 1. Health check
    print("\n1. Testing GET /api/health...")
    with httpx.Client(base_url=API_BASE, timeout=10) as client:
        r = client.get("/api/health")
        print(f"Status: {r.status_code}")
        print("Response:", r.json())
        assert r.status_code == 200
        assert r.json().get("status") == "ok"
        print("PASS: Health check is healthy.")

    # 2. Upload synthetic CBC image
    print("\n2. Testing POST /api/reports/analyze with synthetic lab report image...")
    # Generate clean synthetic image with high-contrast text
    img = Image.new("RGB", (650, 220), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "METROPOLIS CLINICAL LABS", fill=(0, 0, 0))
    draw.text((20, 50), "PATIENT: John Doe    DATE: 12-Nov-2026", fill=(0, 0, 0))
    draw.text((20, 90), "Hemoglobin: 13.8 g/dL    Ref: 12.0 - 15.5", fill=(0, 0, 0))
    draw.text((20, 130), "Fasting Blood Glucose: 108 mg/dL    Ref: 70 - 99", fill=(0, 0, 0))
    draw.text((20, 170), "Platelets: 240 10^3/uL    Ref: 150 - 450", fill=(0, 0, 0))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    with httpx.Client(base_url=API_BASE, timeout=30) as client:
        files = {"file": ("synthetic_cbc_report.png", img_bytes.getvalue(), "image/png")}
        r = client.post("/api/reports/analyze", files=files)
        print(f"Status: {r.status_code}")
        data = r.json()
        print("File info:", data.get("file_info"))
        print(f"Character count: {data.get('character_count')}")
        print(f"Summary: {data.get('summary')}")
        print(f"Biomarkers extracted: {len(data.get('biomarkers', []))}")
        for b in data.get("biomarkers", []):
            print(f" - {b['name']}: {b['value']} {b['unit']} (Ref: {b['reference_range']}) -> Status: {b['status']}")
            print(f"   Explanation: {b['explanation'][:60]}...")
            if b.get('clarity_note'):
                print(f"   Clarity Note: {b['clarity_note']}")
        
        assert r.status_code == 200
        assert data.get("processing_status") == "success"
        assert len(data.get("biomarkers", [])) >= 1
        print("PASS: Synthetic report uploaded and analyzed successfully.")

    # 3. Test unsupported file format (e.g. .txt)
    print("\n3. Testing POST /api/reports/analyze with unsupported format (.txt)...")
    with httpx.Client(base_url=API_BASE, timeout=10) as client:
        files = {"file": ("notes.txt", b"Unsupported plain text", "text/plain")}
        r = client.post("/api/reports/analyze", files=files)
        print(f"Status: {r.status_code}")
        print("Detail:", r.json().get("detail"))
        assert r.status_code == 400
        print("PASS: Unsupported format correctly rejected with 400.")

    # 4. Test empty file (0 bytes)
    print("\n4. Testing POST /api/reports/analyze with empty file (0 bytes)...")
    with httpx.Client(base_url=API_BASE, timeout=10) as client:
        files = {"file": ("empty.png", b"", "image/png")}
        r = client.post("/api/reports/analyze", files=files)
        print(f"Status: {r.status_code}")
        print("Detail:", r.json().get("detail"))
        assert r.status_code == 400
        print("PASS: Empty file correctly rejected with 400.")

    print("\n=== ALL E2E API TESTS PASSED! ===")

if __name__ == "__main__":
    run_tests()
