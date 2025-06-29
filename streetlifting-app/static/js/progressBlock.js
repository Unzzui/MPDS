document.addEventListener("DOMContentLoaded", function () {
	console.log("Inicializando barra de progreso del bloque...");

	// Selección de elementos
	const blockInfoSection = document.getElementById("training-block-info");
	const noBlockInfoSection = document.getElementById("no-block-info");
	const progressBar = document.getElementById("progress");

	// Función para cargar información del bloque de entrenamiento
	function loadTrainingBlockInfo() {
		fetch("/get-current-block-json")
			.then((response) => {
				if (!response.ok) {
					throw new Error("No hay bloques activos");
				}
				return response.json();
			})
			.then((data) => {
				console.log("Datos del bloque cargados correctamente:", data);

				// Mostrar la barra de progreso solo si el bloque está en progreso
				if (data.status === "in_progress") {
					blockInfoSection.classList.remove("hidden");
					noBlockInfoSection.classList.add("hidden");

					// Actualizar contenido del bloque
					document.getElementById("current-stage").textContent =
						data.current_stage || "Fase No Definida";
					document.getElementById("current-week").textContent =
						data.current_week || 0;
					document.getElementById("total-weeks").textContent =
						data.duration || 0;

					// Calcular y actualizar la barra de progreso
					const progressPercentage = data.progress_percentage || 0;
					progressBar.style.width = `${progressPercentage}%`;

					// Cambiar el color de la barra de progreso según el porcentaje
					if (progressPercentage <= 25) {
						progressBar.style.backgroundColor = "#ff0000"; // Rojo
					} else if (progressPercentage <= 50) {
						progressBar.style.backgroundColor = "#ffa500"; // Naranja
					} else if (progressPercentage <= 75) {
						progressBar.style.backgroundColor = "#ffff00"; // Amarillo
					} else {
						progressBar.style.backgroundColor = "#4caf50"; // Verde
					}
				} else {
					// Si el bloque no está en progreso, mostrar mensaje de no activos
					blockInfoSection.classList.add("hidden");
					noBlockInfoSection.classList.remove("hidden");
				}
			})
			.catch((error) => {
				console.error("Error al cargar el bloque:", error.message);

				// Si no hay bloques activos, mostrar mensaje correspondiente
				blockInfoSection.classList.add("hidden");
				noBlockInfoSection.classList.remove("hidden");
			});
	}

	// Inicializar el bloque de entrenamiento
	loadTrainingBlockInfo();
});
