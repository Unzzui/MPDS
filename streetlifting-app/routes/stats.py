from flask import Blueprint, render_template

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/view", methods=["GET"])
def view_statistics():
    # Renderiza la página de estadísticas
    return render_template("view_statistics.html")
