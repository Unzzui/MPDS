# API v1 module 
from .auth import router as auth_router
from .workouts import router as workouts_router
from .blocks import router as blocks_router
from .routines import router as routines_router
from .one_rep_maxes import router as one_rep_maxes_router
from .program_templates import router as program_templates_router
from .user_profile import router as user_profile_router

auth = auth_router
workouts = workouts_router
blocks = blocks_router
routines = routines_router
one_rep_maxes = one_rep_maxes_router
program_templates = program_templates_router
user_profile = user_profile_router 