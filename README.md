# EML AdminTool

**EML AdminTool is a Web software to manage a Minecraft Launcher built with [EML Lib](https://github.com/Electron-Minecraft-Launcher/EML-Lib) library.**

![EML AdminTool](./.github/assets/files-updater.png)

[<img src="https://img.shields.io/badge/Discord-EML-5561e6?&style=for-the-badge">](https://emlproject.com/discord/github)
[<img src="https://img.shields.io/badge/platforms-Docker-0077DA?style=for-the-badge&color=0077DA">](#platforms)
[<img src="https://img.shields.io/badge/version-2.3.3-orangered?style=for-the-badge&color=orangered">](package.json)

<p>
<center>
<a href="https://emlproject.com/discord/github">
  <img src="./.github/assets/gg.png" alt="EML AdminTool Logo" width="300"/>
</a>
</center>
</p>

---

## Features

<!-- - **Files Updater**: Update your Minecraft files and loader (Vanilla, Forge or Fabric).
- **Bootstraps**: Auto-update your Minecraft Launcher.
- **Maintenance**: Manage your Minecraft Launcher.
- **News**: Manage your Minecraft Launcher news.
- **Background**: Manage your Minecraft Launcher background.
- **Stats**: See stats about your Launcher.
- The Admin of the server can manage the users permissions.
- And more... -->

### General settings

General settings allow you to manage the identity of your panel, monitor your server's health, manage updates, and most importantly, control who has access to your launcher configuration.

_Read the [docs](https://emlproject.pages.dev/docs/general-settings)._

### Profile management

_Profiles_ allow you to manage different configurations for your launcher. Each profile has its own files, loader configuration, Minecraft version, and server address — completely isolated from the others.

_Read the [docs](https://emlproject.pages.dev/docs/profile-management)._

### Files Updater and Loader

The _Files Updater_ is the heart of your launcher's content management. This is where you decide exactly what your players will download and run. It handles both game content (mods, configs, resource packs) and the game engine (loader) for each profile.

_Read the [docs](https://emlproject.pages.dev/docs/files-updater-and-loader)._

### Bootstraps

The _Bootstraps_ section allows you to manage the updates of the launcher software itself (the executable file), distinct from the game files.

When you fix a bug in your Electron code or change the design of the launcher interface, you generate a new executable. _Bootstraps_ allows you to distribute that new version to all your players automatically.

_Read the [docs](https://emlproject.pages.dev/docs/bootstraps)._

### Maintenance

The _Maintenance_ feature allows you to temporarily block access to the launcher. This is an essential safety tool when you are updating modpacks, fixing critical bugs, or performing server maintenance.

When maintenance is active, players will see a specific screen on their launcher preventing them from launching the game, displaying the reason and the estimated duration of the downtime.

_Read the [docs](https://emlproject.pages.dev/docs/maintenance)._

### News

The News feature allows you to communicate directly with your players. Articles published will appear on the launcher's home page, allowing you to share changelogs, server events, or maintenance announcements.

_Read the [docs](https://emlproject.pages.dev/docs/news)._

### Background

The Backgrounds feature allows you to customize the visual appearance of your launcher. You can upload multiple images and choose which one is currently displayed to your players.

_Read the [docs](https://emlproject.pages.dev/docs/background)._

### Stats

> Work in progress, coming soon.

## Comparison with other approaches

Managing a modpack server-side can be done in several ways. Here is how EML AdminTool compares to common alternatives.

| Approach                                            | Setup effort              | Update workflow                                | Access control                    | Maintenance mode | News & background | Works without EML Lib        |
| --------------------------------------------------- | ------------------------- | ---------------------------------------------- | --------------------------------- | ---------------- | ----------------- | ---------------------------- |
| **EML AdminTool**                                   | Low (Docker, one command) | Upload via dashboard, propagates automatically | Per-user, per-profile permissions | Built-in         | Built-in          | No                           |
| **Manual file hosting** (VPS, CDN, GitHub Releases) | Low                       | Manual re-upload + update JSON                 | None                              | None             | None              | Yes                          |
| **Custom admin panel**                              | High                      | Custom-built                                   | Custom-built                      | Custom-built     | Custom-built      | Yes                          |
| **CurseForge / Modrinth**                           | None                      | Platform-managed                               | Platform-managed                  | No               | No                | Yes (platform launcher only) |
| **Pterodactyl + scripts**                           | High                      | Via SSH / scripts                              | Pterodactyl users                 | Manual           | None              | Yes                          |

### When to use EML AdminTool

EML AdminTool is the right choice if you want to:

- manage multiple Minecraft instances (Profiles) from a single interface,
- give staff members scoped access to specific profiles without giving them server access,
- push modpack updates without touching your launcher code,
- display news or maintenance messages inside your launcher.

If you only need to distribute a static modpack without a backend, EML Lib's [agnostic mode](https://emlproject.com/docs/launch-settings) with a self-hosted JSON file is a simpler alternative — no EML AdminTool required.

## Installation

EML AdminTool requires Docker to be installed on your system. Please follow [this guide](https://emlproject.com/docs/) to install Docker and EML AdminTool.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Important information

- This repository contains a `.env` file. All the information in this file is fake (random strings), and will be replaced by the real information when you install EML AdminTool.
- This Web software is under the `GNU AGPLv3` license; to get more information, please read the file `LICENSE`. It is legally obligatory to respect this license.
- If you need some help, you can join [this Discord](https://emlproject.com/discord/github).

