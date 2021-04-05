# pagepdf-rendering-server

**pagepdf-rendering-server** is a service for generating PDF file from HTML (via URL) on server. It integrates [electron-pdf](https://github.com/fraserxu/electron-pdf) with [express](https://github.com/expressjs/express) and [lowdb](https://github.com/typicode/lowdb) to serve client as a REST API.

## Installation
First, please make sure you have npm installed on your machine.
Next, clone this repository, run `npm install` then `npm start`.
```bash
git clone https://github.com/tithanayut/pagepdf-rendering-server.git
cd pagepdf-rendering-server
npm install
npm start
```
The server, by default, will start on port 3000. You can custom this by set up an environment variable name PORT as you desire.

## Usage
 - Follow the instruction above to deploy a pagepdf-rendering-server instance.
 - Initiate GET or POST requests to the server as follows. Replace `localhost:3000` with your hostname and port.
	
	 - First, initialize a task by submitting a POST request to `http://localhost:3000/pdf` with the following JSON in the request body.
		```json
		{
			"url": "https://example.com/example.html"
		}
		```
		Optionally, you can include one or more of the following configs with the request.
		```json
		{
			"printBackground": false,
			"landscape": false,
			"marginsType": 0,
			"pageSize": "A4"
		}
		```
		Note: The values above are the default config.
				For `marginsType`: 0 - default margins, 1 - no margins, 2 - minimum margins
		
		If the request you supplied is valid, the server will start processing your request and will reply: 
		```json
		{
			"id": "0cde54cd-366c-453e-a412-d1b159a24960",
			"status": 202
		}
		```
		Take note of the task id (`"id"`) replied by the server then continuously check the task status by sending a GET request to `http://localhost:3000/pdf/<id>` where `<id>` is the task id until you receive status `200`.
		 ```json
		{
			"id": "0cde54cd-366c-453e-a412-d1b159a24960",
			"status": 200
		}
		```
		If that is the case, the generated PDF file should be available at `http://localhost:3000/pdf/<id>.pdf`

## Known issues
 
 - Prevention of Local File Inclusion (LFI) hasn't been implemented.
 -  Large webpage takes time to generate.
 
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
