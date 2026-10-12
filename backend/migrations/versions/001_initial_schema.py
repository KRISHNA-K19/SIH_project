"""Initial schema migration: Users, Cases, Documents, Analysis, and Audit.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-12 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='OFFICER'),
        sa.Column('badge_number', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_role', 'users', ['role'])

    # 2. cases
    op.create_table(
        'cases',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('case_number', sa.String(length=64), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING_REVIEW'),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('assigned_officer_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_by_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_cases_case_number', 'cases', ['case_number'])
    op.create_index('ix_cases_status', 'cases', ['status'])
    op.create_index('ix_cases_assigned', 'cases', ['assigned_officer_id'])
    op.create_index('idx_cases_status_priority', 'cases', ['status', 'priority'])

    # 3. case_subjects
    op.create_table(
        'case_subjects',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('date_of_birth', sa.String(length=30), nullable=True),
        sa.Column('nationality', sa.String(length=10), nullable=True),
        sa.Column('id_number', sa.String(length=100), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_subjects_case_id', 'case_subjects', ['case_id'])
    op.create_index('idx_subjects_name_id', 'case_subjects', ['full_name', 'id_number'])

    # 4. documents
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('storage_filename', sa.String(length=255), nullable=False, unique=True),
        sa.Column('storage_path', sa.String(length=512), nullable=False),
        sa.Column('processed_storage_path', sa.String(length=512), nullable=True),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('sha256_hash', sa.String(length=64), nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=False, server_default='PASSPORT'),
        sa.Column('upload_status', sa.String(length=50), nullable=False, server_default='STORED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_documents_case_id', 'documents', ['case_id'])
    op.create_index('ix_documents_sha256', 'documents', ['sha256_hash'])
    op.create_index('idx_documents_case_hash', 'documents', ['case_id', 'sha256_hash'])

    # 5. analysis_runs
    op.create_table(
        'analysis_runs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('document_id', sa.String(length=36), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False, server_default='1.0.0'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('summary_notes', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_analysis_document_id', 'analysis_runs', ['document_id'])
    op.create_index('ix_analysis_case_id', 'analysis_runs', ['case_id'])
    op.create_index('idx_analysis_status_case', 'analysis_runs', ['case_id', 'status'])

    # 6. extracted_fields
    op.create_table(
        'extracted_fields',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('analysis_run_id', sa.String(length=36), sa.ForeignKey('analysis_runs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=False),
        sa.Column('raw_value', sa.Text(), nullable=True),
        sa.Column('normalized_value', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=False, server_default='OCR'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_fields_run_id', 'extracted_fields', ['analysis_run_id'])
    op.create_index('idx_fields_run_name', 'extracted_fields', ['analysis_run_id', 'field_name'])

    # 7. evidence_findings
    op.create_table(
        'evidence_findings',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('analysis_run_id', sa.String(length=36), sa.ForeignKey('analysis_runs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('finding_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('details_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_findings_run_id', 'evidence_findings', ['analysis_run_id'])
    op.create_index('idx_evidence_severity_type', 'evidence_findings', ['severity', 'finding_type'])

    # 8. risk_assessments
    op.create_table(
        'risk_assessments',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('analysis_run_id', sa.String(length=36), sa.ForeignKey('analysis_runs.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.String(length=20), nullable=False, server_default='LOW'),
        sa.Column('policy_version', sa.String(length=50), nullable=False, server_default='1.0.0'),
        sa.Column('factors_json', sa.Text(), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_risk_case_id', 'risk_assessments', ['case_id'])
    op.create_index('idx_risk_level_score', 'risk_assessments', ['risk_level', 'overall_score'])

    # 9. officer_decisions
    op.create_table(
        'officer_decisions',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('officer_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('decision', sa.String(length=50), nullable=False),
        sa.Column('comments', sa.Text(), nullable=False),
        sa.Column('analysis_run_id', sa.String(length=36), sa.ForeignKey('analysis_runs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_decisions_case_id', 'officer_decisions', ['case_id'])
    op.create_index('idx_decision_case_officer', 'officer_decisions', ['case_id', 'officer_id'])

    # 10. case_timeline
    op.create_table(
        'case_timeline',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_timeline_case_id', 'case_timeline', ['case_id'])
    op.create_index('idx_timeline_case_created', 'case_timeline', ['case_id', 'created_at'])

    # 11. audit_events
    op.create_table(
        'audit_events',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.String(length=100), nullable=True),
        sa.Column('details_json', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_user_id', 'audit_events', ['user_id'])
    op.create_index('idx_audit_action_resource', 'audit_events', ['action', 'resource_type'])
    op.create_index('idx_audit_user_created', 'audit_events', ['user_id', 'created_at'])

    # 12. identity_links
    op.create_table(
        'identity_links',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('source_case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_case_id', sa.String(length=36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('match_type', sa.String(length=50), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('details_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_identity_links_cases', 'identity_links', ['source_case_id', 'target_case_id'])


def downgrade() -> None:
    op.drop_table('identity_links')
    op.drop_table('audit_events')
    op.drop_table('case_timeline')
    op.drop_table('officer_decisions')
    op.drop_table('risk_assessments')
    op.drop_table('evidence_findings')
    op.drop_table('extracted_fields')
    op.drop_table('analysis_runs')
    op.drop_table('documents')
    op.drop_table('case_subjects')
    op.drop_table('cases')
    op.drop_table('users')
