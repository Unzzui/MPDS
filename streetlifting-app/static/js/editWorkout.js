document.addEventListener("DOMContentLoaded", async () => {
	// Función para convertir nombres en identificadores seguros
	function toSafeName(name) {
		return name
			.replace(/[^\w]/g, "_") // Reemplaza caracteres no alfanuméricos con "_"
			.replace(/__+/g, "_") // Elimina múltiplos "_"
			.toLowerCase(); // Opcional: convierte todo a minúsculas
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
	const saveProgressEndpoint = "/edit-workout-progress"; // Cambiar endpoint para edición
	// Variables principales
	const setContainer = document.getElementById("set-container");
	if (!setContainer) {
		console.error(
			"No se encontró el contenedor de ejercicios (set-container)."
		);
		return;
	}
	let predefinedExercises = [];

	let isFormInitialized = true;

	// Reconstruir ejercicios
	// Al enviar el formulario
	workoutForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const workoutId = workoutForm.dataset.workoutId || null;
		const workoutDate = document.getElementById("date").value || null;
		const dayType = workoutForm.dataset.dayType || null;

		const jsonData = {
			id: workoutId,
			date: workoutDate,
			day_type: dayType,
			inprogress: false, // Siempre "false" en edición
			completed: true, // Siempre "true" en edición
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
				window.location.href = "/history"; // Redirige al historial
			} else {
				console.error("Error al guardar el entrenamiento:", result.message);
				alert("Hubo un problema al guardar el entrenamiento.");
			}
		} catch (err) {
			console.error("Error al guardar el entrenamiento:", err);
			alert("Error de conexión al guardar el entrenamiento.");
		}
	});
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
	// Guardar progreso en vivo
	window.saveProgress = () => {
		if (!isFormInitialized) {
			console.log("Formulario aún no inicializado.");
			return;
		}

		const workoutId = workoutForm.dataset.workoutId || null; // Capturar ID del entrenamiento
		const dayType = workoutForm.dataset.dayType || null; // Capturar tipo de día
		const workoutDate = document.getElementById("date").value || null; // Capturar fecha

		console.log("Day Type desde dataset:", dayType);
		console.log("Workout ID:", workoutId);
		console.log("Workout Date:", workoutDate);

		// Validar datos esenciales
		if (!workoutId || !dayType || !workoutDate) {
			console.error("Faltan datos esenciales para guardar el progreso.");
			alert(
				"Por favor, verifica que todos los campos necesarios estén completos."
			);
			return;
		}

		const jsonData = {
			id: workoutId,
			date: workoutDate,
			day_type: dayType,
			inprogress: false,
			completed: true,
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
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error en la solicitud: ${response.status}`);
				}
				return response.json();
			})
			.then((result) => {
				console.log("Progreso guardado automáticamente:", result);
			})
			.catch((err) => {
				console.error("Error al guardar automáticamente:", err);
				alert("Hubo un problema al guardar el progreso. Intenta nuevamente.");
			});
	};

	const debouncedSaveProgress = debounce(window.saveProgress, 2000);
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
	function removeExercise(safeName) {
		// Obtener el contenedor del ejercicio a eliminar
		const exerciseContainer = document.getElementById(`exercise_${safeName}`);

		// Verificar si el contenedor existe
		if (!exerciseContainer) {
			alert("El ejercicio no se pudo encontrar.");
			return;
		}

		// Eliminar el contenedor del DOM
		exerciseContainer.remove();

		// Registrar mensaje en la consola (para depuración)
		console.log(`Ejercicio "${safeName}" eliminado.`);

		// Llamar a guardar progreso automáticamente
		if (typeof saveProgress === "function") {
			debouncedSaveProgress();
		}
	}

	// Carga lista de ejercicios predefinidos
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
			option.textContent = exercise; // Ej: "Barbell Curl (EZ Bar)"
			selector.appendChild(option);
		});
	} catch (error) {
		console.error("Error al cargar ejercicios:", error.message);
		alert("Hubo un error al cargar los ejercicios. Inténtalo de nuevo.");
	}

	// Agregar un ejercicio nuevo (botón "Agregar Ejercicio")
	document.getElementById("add-exercise-btn").addEventListener("click", () => {
		const selector = document.getElementById("exercise-selector");
		console.log(selector.value);
		const selectedSafeName = selector.value;

		if (!selectedSafeName) {
			alert("Selecciona un ejercicio.");
			return;
		}

		if (document.getElementById(`exercise_${selectedSafeName}`)) {
			alert("Este ejercicio ya fue agregado.");
			return;
		}

		// Crear contenedor
		const exerciseContainer = document.createElement("div");
		exerciseContainer.id = `exercise_${selectedSafeName}`;
		exerciseContainer.className = "exercise-container";

		// Input hidden para que el backend reciba "exercise_names"
		const hiddenInput = document.createElement("input");
		hiddenInput.type = "hidden";
		hiddenInput.name = "exercise_names";
		hiddenInput.value = selectedSafeName;
		exerciseContainer.appendChild(hiddenInput);

		// Resto del HTML
		exerciseContainer.innerHTML += `
  <div class="exercise-header">
    <h4>${selectedSafeName}</h4>
    <button class="btn-secondary" type="button" onclick="removeExercise('${selectedSafeName}')">
      Eliminar Ejercicio
    </button>
  </div>
  <table class="exercise-table">
    <thead>
      <tr>
        <th>Peso (kg)</th>
        <th>Reps</th>
        <th>RPE</th>
        <th>Notas</th>
        <th>¿Finish?</th>
        <th>Borrar</th>
      </tr>
    </thead>
    <tbody id="sets_${selectedSafeName}">
      <tr>
        <td><input type="number" name="weight_${selectedSafeName}[]" step="0.1" required /></td>
        <td><input type="number" name="reps_${selectedSafeName}[]" required /></td>
        <td><input type="number" name="rpe_${selectedSafeName}[]" step="0.1" /></td>
        <td><input type="text" name="notes_${selectedSafeName}[]" /></td>
        <td><input type="checkbox" name="completed_${selectedSafeName}[]" value="true" checked /></td>
        <td><button class="btn" type="button" onclick="this.closest('tr').remove()">Serie</button></td>
      </tr>
    </tbody>
  </table>
  <button class="btn" type="button" onclick="addSet('${selectedSafeName}')">
    Agregar Serie
  </button>
`;
		setContainer.appendChild(exerciseContainer);

		// Listeners
		exerciseContainer.querySelectorAll("input, select").forEach((input) => {
			input.addEventListener("input", debouncedSaveProgress);
			input.addEventListener("change", debouncedSaveProgress);
		});

		// Guardar de inmediato
		debouncedSaveProgress();
	});

	// Listeners para guardar en vivo
	workoutForm.addEventListener("input", debouncedSaveProgress);
	workoutForm.addEventListener("change", debouncedSaveProgress);
});
