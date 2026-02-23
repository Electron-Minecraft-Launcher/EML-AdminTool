# EML AdminTool

**EML AdminTool is a Web software to manage a Minecraft Launcher built with [EML Lib](https://github.com/Electron-Minecraft-Launcher/EML-Lib) library.**

![EML AdminTool](./.github/assets/files-updater.png)

[<img src="https://img.shields.io/badge/Discord-EML-5561e6?&style=for-the-badge">](https://discord.gg/YVB4k6HzAY)
[<img src="https://img.shields.io/badge/platforms-Docker-0077DA?style=for-the-badge&color=0077DA">](#platforms)
[<img src="https://img.shields.io/badge/version-2.0.0-orangered?style=for-the-badge&color=orangered">](package.json)

<p>
<center>
<a href="https://discord.gg/YVB4k6HzAY">
  <img src="./.github/assets/gg.png" alt="EML AdminTool Logo" width="300"/>
</a>
</center>
</p>

---

## Features

* **Files Updater**: Update your Minecraft files and loader (Vanilla, Forge or Fabric).
* **Bootstraps**: Auto-update your Minecraft Launcher.
* **Maintenance**: Manage your Minecraft Launcher.
* **News**: Manage your Minecraft Launcher news.
* **Background**: Manage your Minecraft Launcher background.
* **Stats**: See stats about your Launcher.
* The Admin of the server can manage the users permissions.
* And more...

## Installation

Please follow [this guide](https://emlproject.pages.dev/docs/). 

### If you won't use a VPS

You can download the previous major version of the [EML AdminTool](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool). However, be careful, this version is no longer maintained and has security vulnerabilities.

## Contributing

### Translation

You can help to translate EML AdminTool!

The languages files are [here](./client/src/lib/locales/). You can create another file with your translation. Please make sure to provide a correct translation!

Then, you can submit your translation file as an [issue](https://github.com/Electron-Minecraft-Launcher/EML-AdminTool/issues/new?template=translation.md), by using the *Language* issue template. Your file needs to be checked and approved by two other persons.

### Development

Install [Node.js](https://nodejs.org/en/download/package-manager) and [Docker](https://www.docker.com/get-started) [^3].

Then, download the code and run the command:
```bash
cd EML-AdminTool
npm i
```

You can now start the development server:
```bash
cd docker
docker-compose -f docker-compose.dev.yml up
```

The application is accessible at [http://localhost:5173](http://localhost:5173). You can also access pgAdmin at [https://localhost:5050](http://localhost:5050).

<details>
<summary>How to connect to pgAdmin?</summary>
To connect to pgAdmin, you can use the following information:

* **Email**: `admintool@eml.com`
* **Password**: `eml`

Then, you can add a new server with the following information:
* **Host**: `dbs`
* **Port**: `5432`
* **Username**: `eml`
* **Password**: the value of `DATABASE_PASSWORD` in the `.env` file
</details>

You can now make pull requests!

## Important information

* This repository contains a `.env` file. All the information in this file is fake (random strings), and will be replaced by the real information when you install EML AdminTool.
* This Web software is under the `GNU AGPLv3` license; to get more information, please read the file `LICENSE`. It is legally obligatory to respect this license.
* If you need some help, you can join [this Discord](https://discord.gg/YVB4k6HzAY).

<br>

[^1]: The Docker Engine installation tutorial from the official Docker documentation includes the installation of Docker Compose.

[^2]: NGINX (or Apache) is recommended to use EML AdminTool in production. It allows you to use a domain name and an SSL certificate. If you don't use NGINX (or Apache), you can use EML AdminTool with the IP address of your VPS. However, it is not recommended to use EML AdminTool without a domain name and an SSL certificate.

[^3]: On desktop (Windows, macOS and Linux), you can use Docker Desktop, which includes Docker and Docker Compose. On a server (Linux), you should install Docker and Docker Compose separately.
