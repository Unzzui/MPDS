from flask import Flask
from extensions import db  # Importamos db desde extensions.py
from static.utils.file_initializer import (
    initialize_all_files,
    remove_duplicates_and_sort_exercises,
)


# Configuración de la aplicación
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///streetlifting.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = "clave_super_secreta"

# Inicializar la base de datos con la app
db.init_app(app)

initialize_all_files()
remove_duplicates_and_sort_exercises()

# Importar rutas
from routes.index import index_bp
from routes.setup import setup_bp
from routes.workouts import workouts_bp
from routes.records import records_bp
from routes.blocks import blocks_bp
from routes.calendar import calendar_bp
from routes.projections import projections_bp
from routes.stats import stats_bp
from routes.routines import routines_bp


# Registrar Blueprints
app.register_blueprint(index_bp)
app.register_blueprint(workouts_bp)
app.register_blueprint(records_bp)
app.register_blueprint(blocks_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(setup_bp)
app.register_blueprint(projections_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(routines_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

# Para que funcione en ngrok
# if __name__ == "__main__":
#     with app.app_context():
#         db.create_all()
#     app.run(host="0.0.0.0", port=5000, debug=True)
