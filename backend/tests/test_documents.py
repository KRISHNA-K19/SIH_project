"""
Tests for Document upload validation, security signatures, and file retrieval.
"""

def test_upload_valid_jpeg(client, supervisor_headers, valid_jpeg_bytes):
    # Create case
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Doc Upload Case"})
    case_id = c_resp.json()["id"]

    # Upload JPEG
    files = {"file": ("passport_scan.jpg", valid_jpeg_bytes, "image/jpeg")}
    upload_resp = client.post(
        f"/api/v1/cases/{case_id}/documents",
        headers=supervisor_headers,
        files=files,
        data={"document_type": "PASSPORT"},
    )
    assert upload_resp.status_code == 201
    data = upload_resp.json()["document"]
    assert data["original_filename"] == "passport_scan.jpg"
    assert data["mime_type"] == "image/jpeg"
    assert len(data["sha256_hash"]) == 64
    assert data["upload_status"] == "STORED"


def test_upload_valid_png(client, supervisor_headers, valid_png_bytes):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Doc PNG Case"})
    case_id = c_resp.json()["id"]

    files = {"file": ("id_card.png", valid_png_bytes, "image/png")}
    upload_resp = client.post(
        f"/api/v1/cases/{case_id}/documents",
        headers=supervisor_headers,
        files=files,
        data={"document_type": "ID_CARD"},
    )
    assert upload_resp.status_code == 201
    assert upload_resp.json()["document"]["mime_type"] == "image/png"


def test_reject_empty_file(client, supervisor_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Empty File Case"})
    case_id = c_resp.json()["id"]

    files = {"file": ("empty.jpg", b"", "image/jpeg")}
    resp = client.post(f"/api/v1/cases/{case_id}/documents", headers=supervisor_headers, files=files)
    assert resp.status_code == 400
    assert "empty" in resp.json()["message"].lower()


def test_reject_unsupported_extension(client, supervisor_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Bad Ext Case"})
    case_id = c_resp.json()["id"]

    files = {"file": ("malicious.exe", b"MZ_binary_content", "application/octet-stream")}
    resp = client.post(f"/api/v1/cases/{case_id}/documents", headers=supervisor_headers, files=files)
    assert resp.status_code == 400
    assert "Unsupported file extension" in resp.json()["message"]


def test_reject_fake_extension_signature_mismatch(client, supervisor_headers):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Spoofed Signature Case"})
    case_id = c_resp.json()["id"]

    # Plain text file disguised with .jpg extension
    fake_content = b"This is just plain text, not a real JPEG image file."
    files = {"file": ("fake_passport.jpg", fake_content, "image/jpeg")}
    resp = client.post(f"/api/v1/cases/{case_id}/documents", headers=supervisor_headers, files=files)
    assert resp.status_code == 400
    assert "Invalid file signature" in resp.json()["message"]


def test_download_document_file(client, supervisor_headers, valid_jpeg_bytes):
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Download Test Case"})
    case_id = c_resp.json()["id"]

    files = {"file": ("test_doc.jpg", valid_jpeg_bytes, "image/jpeg")}
    upload_resp = client.post(f"/api/v1/cases/{case_id}/documents", headers=supervisor_headers, files=files)
    doc_id = upload_resp.json()["document"]["id"]

    # Download
    dl_resp = client.get(f"/api/v1/documents/{doc_id}/file", headers=supervisor_headers)
    assert dl_resp.status_code == 200
    assert dl_resp.content == valid_jpeg_bytes
    assert dl_resp.headers["content-type"] == "image/jpeg"
