document.addEventListener("DOMContentLoaded", function () {
	console.log("Inicializando calendario...");

	// Selección de elementos
	const prevMonthButton = document.getElementById("prev-month");
	const nextMonthButton = document.getElementById("next-month");
	const calendar = document.getElementById("calendar");
	const dayDetails = document.getElementById("day-details");
	const dayInfo = document.getElementById("day-info");
	const closeDetailsButton = document.getElementById("close-details");

	let currentDate = new Date();
	let currentYear = currentDate.getFullYear();
	let currentMonth = currentDate.getMonth();
	let today = currentDate.getDate();

	// Actualizar el mes actual
	function updateMonthLabel() {
		const monthNames = [
			"Enero",
			"Febrero",
			"Marzo",
			"Abril",
			"Mayo",
			"Junio",
			"Julio",
			"Agosto",
			"Septiembre",
			"Octubre",
			"Noviembre",
			"Diciembre",
		];
		document.getElementById(
			"current-month"
		).textContent = `${monthNames[currentMonth]} ${currentYear}`;
	}

	// Generar datos básicos del calendario (ajustando el inicio al lunes)
	function generateBasicCalendarData(year, month) {
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		let firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = domingo
		firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustar para que lunes sea el primer día

		console.log("Días en el mes:", firstDayOfWeek, daysInMonth);
		const calendarData = [];

		// Días vacíos antes del primer día del mes
		for (let i = 0; i < firstDayOfWeek; i++) {
			calendarData.push({ day: null, status: "inactive", type: "", emoji: "" });
		}

		// Días del mes
		for (let day = 1; day <= daysInMonth; day++) {
			calendarData.push({
				day,
				status: "upcoming",
				type: "No definido",
				emoji: "",
			});
		}

		// Días vacíos al final de la semana para completar la última fila
		while (calendarData.length % 7 !== 0) {
			calendarData.push({ day: null, status: "inactive", type: "", emoji: "" });
		}

		return calendarData;
	}

	// Cargar datos del calendario desde el backend
	function loadCalendarData(year, month) {
		fetch(`/calendar-data?year=${year}&month=${month + 1}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Error al cargar datos del servidor.");
				}
				return response.json();
			})
			.then((data) => {
				if (!Array.isArray(data)) {
					console.warn(
						"No hay datos disponibles. Generando calendario básico..."
					);
					const basicCalendarData = generateBasicCalendarData(year, month);
					renderCalendar(basicCalendarData);
					return;
				}

				// Actualizar datos con estados y emojis
				data.forEach((day) => {
					if (day.status === "completed") {
						day.emoji = "✅"; // Entrenamiento completado
					} else if (day.status === "block_end") {
						day.emoji = "🏁"; // Fin del bloque
					} else if (day.type && day.type !== "No definido") {
						day.emoji = "📅"; // Día con rutina programada
					} else {
						day.emoji = ""; // Día sin datos
					}
				});

				renderCalendar(data);
			})
			.catch((error) => {
				console.error("Error al cargar el calendario:", error);
				const basicCalendarData = generateBasicCalendarData(year, month);
				renderCalendar(basicCalendarData);
			});
	}

	// Renderizar el calendario
	function renderCalendar(data) {
		calendar.innerHTML = ""; // Limpiar el calendario existente

		// Crear tabla
		const table = document.createElement("table");
		table.classList.add("calendar-table");

		// Encabezado con los días de la semana
		const headerRow = document.createElement("tr");
		["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].forEach((day) => {
			const th = document.createElement("th");
			th.textContent = day;
			headerRow.appendChild(th);
		});
		table.appendChild(headerRow);

		// Filas del calendario
		let row = document.createElement("tr");
		data.forEach((day, index) => {
			const cell = document.createElement("td");
			cell.classList.add("calendar-day");

			// Aplicar clases basadas en el estado del día
			if (day.status === "inactive") {
				cell.classList.add("inactive");
			} else if (day.status === "completed") {
				cell.classList.add("completed");
				cell.dataset.workoutId = day.workout_id;
				cell.dataset.type = day.type;
				cell.addEventListener("click", () => showDayDetails(day));
			} else if (day.status === "block_end") {
				cell.classList.add("block-end");
			} else if (day.status === "upcoming") {
				cell.classList.add("upcoming");
				cell.addEventListener("click", () => showDayDetails(day));
			}

			// Contenido de la celda
			if (day.day !== null) {
				const type = day.type || "";
				const emoji = day.emoji || "";
				cell.innerHTML = `<div>${day.day}</div><small>${type} ${emoji}</small>`;
				// Destacar el día actual
				if (
					day.day === today &&
					currentMonth === currentDate.getMonth() &&
					currentYear === currentDate.getFullYear()
				) {
					cell.classList.add("current-day");
				}
			} else {
				cell.textContent = ""; // Celdas vacías para días inactivos
			}

			row.appendChild(cell);

			// Crear una nueva fila al completar una semana
			if ((index + 1) % 7 === 0) {
				table.appendChild(row);
				row = document.createElement("tr");
			}
		});

		// Agregar la última fila si no está completa
		if (row.children.length > 0) {
			table.appendChild(row);
		}

		calendar.appendChild(table);
	}

	// Mostrar detalles del día
	function showDayDetails(day) {
		const type = day.type || "No especificado";
		const emoji = day.emoji || "";
		const workoutId = day.workout_id || null;
		const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
			2,
			"0"
		)}-${String(day.day).padStart(2, "0")}`;

		dayInfo.innerHTML = `
            <p>Día: ${day.day || "No disponible"}</p>
            <p>Estado: ${day.status || "No especificado"}</p>
            <p>Tipo: ${type} ${emoji}</p>
            ${
							workoutId
								? `<p>Entrenamiento ID: ${workoutId}</p>`
								: `<button id="add-workout-button" data-date="${formattedDate}" data-day-type="${type}" class="btn">Agregar Entrenamiento</button>`
						}
        `;

		dayDetails.classList.remove("hidden");

		const addWorkoutButton = document.getElementById("add-workout-button");
		if (addWorkoutButton) {
			addWorkoutButton.addEventListener("click", () => {
				const date = addWorkoutButton.dataset.date;
				const dayType = addWorkoutButton.dataset.dayType;

				if (dayType === "default" || dayType === "No definido") {
					alert("El tipo de día no está definido.");
					return;
				}

				window.location.href = `/log/${encodeURIComponent(
					dayType
				)}?date=${date}`;
			});
		}
	}

	closeDetailsButton.addEventListener("click", () => {
		dayDetails.classList.add("hidden");
	});

	function changeMonth(offset) {
		currentMonth += offset;
		if (currentMonth < 0) {
			currentMonth = 11;
			currentYear--;
		} else if (currentMonth > 11) {
			currentMonth = 0;
			currentYear++;
		}
		updateMonthLabel();
		loadCalendarData(currentYear, currentMonth);
	}

	prevMonthButton.addEventListener("click", () => changeMonth(-1));
	nextMonthButton.addEventListener("click", () => changeMonth(1));

	// Inicializar el calendario
	updateMonthLabel();
	loadCalendarData(currentYear, currentMonth);
});
