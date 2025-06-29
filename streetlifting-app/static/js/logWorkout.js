document.addEventListener("DOMContentLoaded", async () => {
	// Función para reemplazar espacios, paréntesis, etc.
	function toSafeName(name) {
		return name.replace(/\(/g, "").replace(/\)/g, "").replace(/\s+/g, "_");
	}

	// Función debounce
	function debounce(func, delay) {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), delay);
		};
	}

	const workoutForm = document.querySelector("form");
	const saveProgressEndpoint = "/save-workout-progress";
	const loadProgressEndpoint = "/load-workout-progress";
	const setContainer = document.getElementById("set-container");

	let predefinedExercises = [];
	let isFormInitialized = false;

	// Manejar el evento submit del formulario
	workoutForm.addEventListener("submit", async (event) => {
		event.preventDefault(); // Evita el envío por defecto del formulario

		if (!isFormInitialized) {
			console.log("Formulario aún no inicializado. Esperando...");
			return;
		}

		// Obtener los valores adicionales (date, day_type, etc.)
		const workoutId = workoutForm.dataset.workoutId || null; // Asegúrate de que el ID esté disponible
		const workoutDate = document.getElementById("date").value || null;
		const dayType = workoutForm.dataset.dayType || null; // Asume que tienes un atributo dataset para day_type
		const isInProgress = true; // Cambiar esto solo cuando se complete el workout
		const isCompleted = false;
		const finalize =
			workoutForm.querySelector("[name='save_workout']").value === "true";

		const jsonData = {
			id: workoutId,
			date: workoutDate,
			day_type: dayType,
			inprogress: isInProgress,
			completed: isCompleted,
			finalize: finalize, // Enviar el estado explícitamente

			exercises: [],
		};
		if (!dayType || !workoutId) {
			alert("No se puede guardar. Faltan datos esenciales.");
			return;
		}

		setContainer
			.querySelectorAll(".exercise-container")
			.forEach((exerciseDiv) => {
				const safeName = exerciseDiv.id.replace("exercise_", "");
				const sets = [];

				exerciseDiv.querySelectorAll(`#sets_${safeName} tr`).forEach((row) => {
					const weight =
						row.querySelector(`[name="weight_${safeName}[]"]`)?.value || "";
					const reps =
						row.querySelector(`[name="reps_${safeName}[]"]`)?.value || "";
					const rpe =
						row.querySelector(`[name="rpe_${safeName}[]"]`)?.value || "";
					const notes =
						row.querySelector(`[name="notes_${safeName}[]"]`)?.value || "";
					const completed =
						row.querySelector(`[name="completed_${safeName}[]"]`)?.checked ||
						false;

					sets.push({ weight, reps, rpe, notes, completed });
				});

				jsonData.exercises.push({ name: safeName, sets });
			});

		console.log("Datos enviados al guardar:", jsonData);

		try {
			const response = await fetch(saveProgressEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(jsonData),
			});

			const result = await response.json();

			if (response.ok) {
				alert(result.message);
				window.location.href = result.redirect_url; // Redirige a la página principal
			} else {
				console.error("Error al guardar el entrenamiento:", result.message);
				alert("Hubo un problema al guardar el entrenamiento.");
			}
		} catch (err) {
			console.error("Error al guardar el entrenamiento:", err);
			alert("Error de conexión al guardar el entrenamiento.");
		}
	});

	// Guardar progreso en vivo
	window.saveProgress = () => {
		if (!isFormInitialized) {
			console.log("Formulario aún no inicializado.");
			return;
		}

		const workoutId = workoutForm.dataset.workoutId || null; // Capturar ID del entrenamiento
		const dayType = workoutForm.dataset.dayType || null; // Capturar tipo de día
		const workoutDate = document.getElementById("date").value || null; // Capturar fecha

		const jsonData = {
			id: workoutId,
			date: workoutDate,
			day_type: dayType,
			inprogress: true,
			completed: false,
			exercises: [],
		};

		setContainer
			.querySelectorAll(".exercise-container")
			.forEach((exerciseDiv) => {
				const safeName = exerciseDiv.id.replace("exercise_", "");
				const sets = [];

				exerciseDiv.querySelectorAll(`#sets_${safeName} tr`).forEach((row) => {
					const weight =
						row.querySelector(`[name="weight_${safeName}[]"]`)?.value || "";
					const reps =
						row.querySelector(`[name="reps_${safeName}[]"]`)?.value || "";
					const rpe =
						row.querySelector(`[name="rpe_${safeName}[]"]`)?.value || "";
					const notes =
						row.querySelector(`[name="notes_${safeName}[]"]`)?.value || "";
					const completed =
						row.querySelector(`[name="completed_${safeName}[]"]`)?.checked ||
						false;

					sets.push({ weight, reps, rpe, notes, completed });
				});

				jsonData.exercises.push({ name: safeName, sets });
			});

		console.log("Datos enviados automáticamente:", jsonData);

		fetch(saveProgressEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(jsonData),
		}).catch((err) => console.error("Error al guardar automáticamente:", err));
	};

	const debouncedSaveProgress = debounce(window.saveProgress, 2000);

	// Reconstruir ejercicios (si hay data pendiente)
	const rebuildExercises = (exercises) => {
		setContainer.innerHTML = "";

		exercises.forEach((exercise) => {
			const safeName = toSafeName(exercise.name);
			const exerciseContainer = document.createElement("div");
			exerciseContainer.id = `exercise_${safeName}`;
			exerciseContainer.className = "exercise-container";

			exerciseContainer.innerHTML = `
					<div class="exercise-header">
						<h4>${exercise.name}</h4>
						<button class="btn-secondary" type="button" onclick="removeExercise('${safeName}')">Eliminar Ejercicio</button>
					</div>
					<table class="exercise-table">
						<thead>
							<tr>
								<th>Peso (kg)</th>
								<th>Reps</th>
								<th>RPE</th>
								<th>Notas</th>
								<th>Finish?</th>
								<th>Borrar</th>
							</tr>
						</thead>
						<tbody id="sets_${safeName}"></tbody>
					</table>
					<button class="btn" type="button" onclick="addSet('${safeName}')">Agregar Serie</button>
				`;

			setContainer.appendChild(exerciseContainer);

			const tbody = document.getElementById(`sets_${safeName}`);
			if (!exercise.sets || exercise.sets.length === 0) {
				addSet(safeName);
			} else {
				exercise.sets.forEach((set) => {
					const row = document.createElement("tr");
					row.innerHTML = `
							<td><input type="number" name="weight_${safeName}[]" value="${
						set.weight || ""
					}" step="0.1" required /></td>
							<td><input type="number" name="reps_${safeName}[]" value="${
						set.reps || ""
					}" required /></td>
							<td><input type="number" name="rpe_${safeName}[]" value="${
						set.rpe || ""
					}" step="0.1" /></td>
							<td><input type="text" name="notes_${safeName}[]" value="${
						set.notes || ""
					}" /></td>
							<td><input type="checkbox" name="completed_${safeName}[]" value="true" ${
						set.completed ? "checked" : ""
					} /></td>
							<td><button type="button" class="btn" onclick="removeSet(this)">Serie</button></td>
						`;
					tbody.appendChild(row);
				});
			}

			exerciseContainer.querySelectorAll("input, select").forEach((input) => {
				input.addEventListener("input", debouncedSaveProgress);
				input.addEventListener("change", debouncedSaveProgress);
			});
		});
	};

	// Agregar serie
	function addSet(safeName) {
		const tbody = document.getElementById(`sets_${safeName}`);
		const row = document.createElement("tr");
		row.innerHTML = `
				<td><input type="number" name="weight_${safeName}[]" step="0.1" required /></td>
				<td><input type="number" name="reps_${safeName}[]" required /></td>
				<td><input type="number" name="rpe_${safeName}[]" step="0.1" /></td>
				<td><input type="text" name="notes_${safeName}[]" /></td>
				<td><input type="checkbox" name="completed_${safeName}[]" value="true" checked /></td>
				<td><button type="button" class="btn" onclick="removeSet(this)">Serie</button></td>
			`;
		tbody.appendChild(row);

		row.querySelectorAll("input, select").forEach((input) => {
			input.addEventListener("input", debouncedSaveProgress);
			input.addEventListener("change", debouncedSaveProgress);
		});

		debouncedSaveProgress();
	}

	window.addSet = addSet;

	function removeExercise(safeName) {
		document.getElementById(`exercise_${safeName}`).remove();
		debouncedSaveProgress();
	}

	window.removeExercise = removeExercise;

	function removeSet(button) {
		const row = button.closest("tr");
		if (row) {
			row.remove();
			debouncedSaveProgress();
		}
	}

	window.removeSet = removeSet;
	function addExercise() {
		const selector = document.getElementById("exercise-selector");
		const selectedExercise = selector.value; // Obtener el valor seleccionado
		const exerciseName = predefinedExercises.find(
			(ex) => toSafeName(ex) === selectedExercise
		); // Buscar el nombre original basado en el valor seguro

		if (!exerciseName) {
			alert("Por favor selecciona un ejercicio válido.");
			return;
		}

		const safeName = toSafeName(exerciseName);

		// Verificar si ya existe un contenedor para este ejercicio
		if (document.getElementById(`exercise_${safeName}`)) {
			alert("Este ejercicio ya ha sido agregado.");
			return;
		}

		// Crear el contenedor del ejercicio
		const exerciseContainer = document.createElement("div");
		console.log("Opciones del selector:", selector.innerHTML);

		exerciseContainer.id = `exercise_${safeName}`;
		exerciseContainer.className = "exercise-container";

		exerciseContainer.innerHTML = `
				<div class="exercise-header">
					<h4>${exerciseName}</h4>
					<button class="btn-secondary" type="button" onclick="removeExercise('${safeName}')">Eliminar Ejercicio</button>
				</div>
				<table class="exercise-table">
					<thead>
						<tr>
							<th>Peso (kg)</th>
							<th>Reps</th>
							<th>RPE</th>
							<th>Notas</th>
							<th>Completado</th>
							<th>Borrar</th>
						</tr>
					</thead>
					<tbody id="sets_${safeName}">
						<!-- Aquí se agregará la primera serie automáticamente -->
					</tbody>
				</table>
				<button class="btn" type="button" onclick="addSet('${safeName}')">Agregar Serie</button>
			`;

		setContainer.appendChild(exerciseContainer);

		// Agregar la primera serie automáticamente
		addSet(safeName);

		// Mostrar mensaje en consola
		console.log(`Ejercicio "${exerciseName}" agregado correctamente.`);
	}
	window.addExercise = addExercise;
	// Cargar ejercicios predefinidos
	try {
		const response = await fetch("../static/utils/exercises.json");
		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}
		predefinedExercises = await response.json();

		const selector = document.getElementById("exercise-selector");
		predefinedExercises.forEach((exercise) => {
			const safeName = toSafeName(exercise);
			const option = document.createElement("option");
			option.value = safeName;
			option.textContent = exercise;
			selector.appendChild(option);
		});
	} catch (error) {
		console.error("Error al cargar ejercicios:", error.message);
		alert("Hubo un error al cargar los ejercicios. Inténtalo de nuevo.");
	}

	// Cargar progreso pendiente
	try {
		const response = await fetch(loadProgressEndpoint);
		if (response.ok) {
			const data = await response.json();
			if (data.pending) {
				rebuildExercises(data.formData.exercises || []);
			} else {
				rebuildExercises([{ name: "Pull_Up", sets: [] }]);
			}
		}
		isFormInitialized = true;
	} catch (error) {
		console.error("Error al cargar progreso:", error);
	}

	// Listeners para guardar en vivo
	workoutForm.addEventListener("input", debouncedSaveProgress);
	workoutForm.addEventListener("change", debouncedSaveProgress);

	// Cancelar entrenamiento
	document.getElementById("cancel-workout").addEventListener("click", () => {
		if (confirm("¿Estás seguro de que deseas cancelar el entrenamiento?")) {
			fetch("/cancel-workout", { method: "POST" })
				.then(() => (window.location.href = "/"))
				.catch((err) => console.error("Error al cancelar entrenamiento:", err));
		}
	});
});
