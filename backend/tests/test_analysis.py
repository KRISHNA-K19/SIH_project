"""
Tests for Document Analysis Pipeline, MRZ checksum calculations, image quality, and risk scoring.
"""

from app.services.mrz_service import mrz_service, calculate_icao_check_digit


def test_mrz_checksum_calculation():
    # Test ICAO standard 7-3-1 check digit algorithm
    # Date of birth: 740812 (Aug 12, 1974)
    # Weights: 7*7 + 4*3 + 0*1 + 8*7 + 1*3 + 2*1 = 49 + 12 + 0 + 56 + 3 + 2 = 122 -> 122 % 10 = 2
    check_digit = calculate_icao_check_digit("740812")
    assert check_digit == "2"


def test_td3_passport_mrz_validation():
    # Valid synthetic TD3 passport lines
    line1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<"
    line2 = "L898902C36UTO7408122F1204159ZE184226B<<<<<10"

    is_valid, fields, findings = mrz_service.parse_and_validate([line1, line2])
    assert is_valid is True
    assert fields["surname"] == "ERIKSSON"
    assert fields["given_names"] == "ANNA MARIA"
    assert fields["document_number"] == "L898902C3"
    assert fields["nationality"] == "UTO"
    assert any(f["finding_type"] == "MRZ_CHECKSUMS_VERIFIED" for f in findings)


def test_td3_passport_mrz_corrupted_checksum():
    line1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<"
    # In line 2, doc number is 'L898902C3' with check digit '9' instead of '6'
    line2 = "L898902C39UTO7408122F1204159ZE184226B<<<<<10"

    is_valid, fields, findings = mrz_service.parse_and_validate([line1, line2])
    assert is_valid is False
    assert any(f["finding_type"] == "MRZ_DOC_NUMBER_CHECKSUM_FAILED" for f in findings)


def test_run_analysis_pipeline_on_case_document(client, supervisor_headers, valid_jpeg_bytes):
    # Create case
    c_resp = client.post("/api/v1/cases", headers=supervisor_headers, json={"title": "Analysis Test Case"})
    case_id = c_resp.json()["id"]

    # Upload document
    files = {"file": ("passport.jpg", valid_jpeg_bytes, "image/jpeg")}
    upload_resp = client.post(f"/api/v1/cases/{case_id}/documents", headers=supervisor_headers, files=files)
    doc_id = upload_resp.json()["document"]["id"]

    # Trigger analysis pipeline
    analysis_resp = client.post(
        f"/api/v1/cases/{case_id}/analysis",
        headers=supervisor_headers,
        json={"document_id": doc_id},
    )
    assert analysis_resp.status_code == 200
    runs = analysis_resp.json()
    assert len(runs) == 1
    run = runs[0]

    # Verify status is valid (COMPLETED or PARTIAL depending on OCR installation)
    assert run["status"] in ["COMPLETED", "PARTIAL"]
    assert run["risk_assessment"] is not None
    assert 0.0 <= run["risk_assessment"]["overall_score"] <= 100.0
    assert "decision-support evidence" in run["risk_assessment"]["explanation"]
    assert len(run["evidence_findings"]) > 0


def test_cross_check_and_duplicate_identity_links(client, supervisor_headers, valid_jpeg_bytes):
    # Case 1 with Document
    c1 = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Case 1", "subjects": [{"full_name": "Subject One", "id_number": "DOC123"}]},
    ).json()

    files = {"file": ("doc1.jpg", valid_jpeg_bytes, "image/jpeg")}
    client.post(f"/api/v1/cases/{c1['id']}/documents", headers=supervisor_headers, files=files)
    client.post(f"/api/v1/cases/{c1['id']}/analysis", headers=supervisor_headers, json={})

    # Case 2 with SAME Document (duplicate hash)
    c2 = client.post(
        "/api/v1/cases",
        headers=supervisor_headers,
        json={"title": "Case 2", "subjects": [{"full_name": "Subject Two", "id_number": "DOC999"}]},
    ).json()

    files2 = {"file": ("doc2.jpg", valid_jpeg_bytes, "image/jpeg")}
    client.post(f"/api/v1/cases/{c2['id']}/documents", headers=supervisor_headers, files=files2)
    client.post(f"/api/v1/cases/{c2['id']}/analysis", headers=supervisor_headers, json={})

    # Query identity links on Case 2
    links_resp = client.get(f"/api/v1/cases/{c2['id']}/identity-links", headers=supervisor_headers)
    assert links_resp.status_code == 200
    links = links_resp.json()
    # Should identify duplicate document link to Case 1
    assert any(l["match_type"] == "DUPLICATE_DOCUMENT" for l in links)
