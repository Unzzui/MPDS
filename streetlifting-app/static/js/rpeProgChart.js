function renderCharts(progressionData) {
	const lifts = Object.keys(progressionData);

	lifts.forEach((lift) => {
		const ctx = document.getElementById(`${lift}-chart`).getContext("2d");
		const labels = Object.keys(progressionData[lift]);
		const data = labels.map((week) => progressionData[lift][week].weight);

		new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: [
					{
						label: `${lift} Progression`,
						data: data,
						borderColor: "rgba(75, 192, 192, 1)",
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						fill: false,
					},
				],
			},
			options: {
				responsive: true,
				scales: {
					x: {
						title: {
							display: true,
							text: "Semana",
						},
					},
					y: {
						title: {
							display: true,
							text: "Carga (kg)",
						},
					},
				},
			},
		});
	});
}
