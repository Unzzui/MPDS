"""
Migration to add strategy-specific fields to training_blocks table
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_strategy_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to training_blocks table
    op.add_column('training_blocks', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('training_blocks', sa.Column('volume_multiplier', sa.Float(), nullable=True, server_default='1.0'))
    op.add_column('training_blocks', sa.Column('intensity_focus', sa.String(50), nullable=True, server_default='moderate'))
    op.add_column('training_blocks', sa.Column('daily_variation', sa.String(50), nullable=True, server_default='intensity'))
    op.add_column('training_blocks', sa.Column('intensity_range', sa.String(50), nullable=True, server_default='70-90'))
    op.add_column('training_blocks', sa.Column('volume_cycles', sa.Integer(), nullable=True, server_default='3'))
    op.add_column('training_blocks', sa.Column('max_effort_days', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('training_blocks', sa.Column('dynamic_effort_days', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('training_blocks', sa.Column('repetition_effort_days', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('training_blocks', sa.Column('wave_pattern', sa.String(50), nullable=True, server_default='ascending'))
    op.add_column('training_blocks', sa.Column('wave_amplitude', sa.Integer(), nullable=True, server_default='10'))
    op.add_column('training_blocks', sa.Column('wave_frequency', sa.String(50), nullable=True, server_default='weekly'))
    op.add_column('training_blocks', sa.Column('max_reps', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade():
    # Remove the columns
    op.drop_column('training_blocks', 'max_reps')
    op.drop_column('training_blocks', 'wave_frequency')
    op.drop_column('training_blocks', 'wave_amplitude')
    op.drop_column('training_blocks', 'wave_pattern')
    op.drop_column('training_blocks', 'repetition_effort_days')
    op.drop_column('training_blocks', 'dynamic_effort_days')
    op.drop_column('training_blocks', 'max_effort_days')
    op.drop_column('training_blocks', 'volume_cycles')
    op.drop_column('training_blocks', 'intensity_range')
    op.drop_column('training_blocks', 'daily_variation')
    op.drop_column('training_blocks', 'intensity_focus')
    op.drop_column('training_blocks', 'volume_multiplier')
    op.drop_column('training_blocks', 'description') 