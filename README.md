# Lost Palaces Project

Interactive 3D models of England's vanished royal palaces, 1428–1703, and the website that presents them.

## Folders

```
LostPalacesProject/
├── Hugo-site/            the website (see Hugo-site/README.md)
├── Baynards Castle/      baynardscastle.html + assets/
├── Beaulieu/             beaulieu.html + assets/
├── Bridewell/            bridewell.html + assets/
├── Greenwich/            index.html + assets/
├── Nonsuch/              index.html + assets/
├── Oatlands/             oatlands.html + assets/
├── Richmond/             index.html + assets/
├── The More/             index.html + assets/
└── Whitehall/            index.html + assets/
```

- `Hugo-site/`: the website, built with [Hugo](https://gohugo.io/). See [Hugo-site/README.md](Hugo-site/README.md) for how it is organised and how to build it.
- One folder per 3D model, each holding the model's page file (a self-contained HTML page) and an `assets/` folder of the images it shows. The website reads the models from these folders when it is built and publishes each at `/models/<id>/`.

Research material (sources, scans, notes and work-in-progress models) is kept outside this folder and is not part of the repository.

The models' images are not in this repository yet; they are being checked for copyright one by one. A copy built from this repository shows the models without those images. Once a model's images are cleared, a line such as `!/Greenwich/assets/` is added to `.gitignore` under that model.
