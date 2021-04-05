const ElectronPDF = require("electron-pdf");
const express = require("express");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const fs = require("fs");
const { v4 } = require("uuid");

const config = {
	PORT: process.env.PORT || 3000,
	outputPath: process.env.outputpath || "output",
	logIncompleteRequest: true,
};

if (!fs.existsSync(path.join(config.outputPath))) {
	fs.mkdirSync(path.join(config.outputPath));
}

const app = express();
app.use(express.json());
app.use("/pdf", express.static(path.join(config.outputPath)));

const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ tasks: [] }).write();

const exporter = new ElectronPDF();
exporter.on("charged", () => {
	app.listen(config.PORT, () => {
		console.log(`Rendering Server is running on port ${config.PORT}`);
	});

	app.post("/pdf", (req, res) => {
		const id = v4();

		if (!req.body.url) {
			const status = 400;

			console.log(`Request #${id} : error - url not found`);
			if (config.logIncompleteRequest) {
				db.get("tasks")
					.push({ id, status, error: "url not found" })
					.write();
			}

			return res
				.status(status)
				.json({ id, status, error: "url not found" });
		}

		const url = req.body.url;
		const output = path.join(config.outputPath, `${id}.pdf`);

		// TODO: Prevent LFI

		const jobOptions = {
			inMemory: false,
		};
		const options = {
			printBackground: req.body.printBackground || false,
			landscape: req.body.landscape || false,
			marginsType: req.body.marginsType || 0,
			pageSize: req.body.pageSize || "A4",
		};

		console.log(`Request #${id} : start`);
		exporter.createJob(url, output, options, jobOptions).then((task) => {
			task.on("job-complete", (r) => {
				console.log(`Request #${id} : complete`, r.results);
				db.get("tasks").find({ id }).assign({ status: 200 }).write();
			});
			task.render();
		});

		db.get("tasks").push({ id, status: 202, url }).write();
		return res.status(202).json({
			id,
			status: 202,
		});
	});

	app.get("/pdf/:id", (req, res) => {
		const id = req.params.id;
		if (!db.get("tasks").some({ id }).value()) {
			return res.status(400).json({ error: "task not found" });
		}

		const status = db.get("tasks").find({ id }).value().status;
		return res.status(status).json({ id, status });
	});
});
exporter.start();
